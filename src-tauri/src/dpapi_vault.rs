use std::fs;
use std::path::PathBuf;
use windows::Win32::Foundation::LocalFree;
use windows::Win32::Foundation::HLOCAL;
use windows::Win32::Security::Cryptography::{
    CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB,
};

const VAULT_ENTROPY: &[u8] = b"Pill.WinUI.AstraVault.v2";

fn get_vault_file_path() -> PathBuf {
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| ".".to_string());
    let dir = PathBuf::from(local_app_data).join("PillForWindows");
    let _ = fs::create_dir_all(&dir);
    dir.join("astra_gemini_key.dpapi")
}

#[tauri::command]
pub fn save_custom_api_key(plain_api_key: String) -> Result<bool, String> {
    let trimmed = plain_api_key.trim();
    if trimmed.is_empty() {
        return clear_custom_api_key();
    }

    let mut plain_bytes = trimmed.as_bytes().to_vec();
    let mut entropy_bytes = VAULT_ENTROPY.to_vec();

    let in_blob = CRYPT_INTEGER_BLOB {
        cbData: plain_bytes.len() as u32,
        pbData: plain_bytes.as_mut_ptr(),
    };
    let entropy_blob = CRYPT_INTEGER_BLOB {
        cbData: entropy_bytes.len() as u32,
        pbData: entropy_bytes.as_mut_ptr(),
    };
    let mut out_blob = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptProtectData(
            &in_blob,
            None,
            Some(&entropy_blob),
            None,
            None,
            CRYPTPROTECT_UI_FORBIDDEN,
            &mut out_blob,
        )
        .map_err(|e| format!("DPAPI Encrypt Failed: {e}"))?;

        let cipher_slice =
            std::slice::from_raw_parts(out_blob.pbData, out_blob.cbData as usize).to_vec();
        let _ = LocalFree(HLOCAL(out_blob.pbData as _));
        plain_bytes.fill(0);

        fs::write(get_vault_file_path(), cipher_slice).map_err(|e| e.to_string())?;
    }
    Ok(true)
}

#[tauri::command]
pub fn load_custom_api_key() -> Result<Option<String>, String> {
    let path = get_vault_file_path();
    if !path.exists() {
        return Ok(None);
    }

    let mut cipher_bytes = fs::read(path).map_err(|e| e.to_string())?;
    let mut entropy_bytes = VAULT_ENTROPY.to_vec();

    let in_blob = CRYPT_INTEGER_BLOB {
        cbData: cipher_bytes.len() as u32,
        pbData: cipher_bytes.as_mut_ptr(),
    };
    let entropy_blob = CRYPT_INTEGER_BLOB {
        cbData: entropy_bytes.len() as u32,
        pbData: entropy_bytes.as_mut_ptr(),
    };
    let mut out_blob = CRYPT_INTEGER_BLOB::default();

    unsafe {
        if CryptUnprotectData(
            &in_blob,
            None,
            Some(&entropy_blob),
            None,
            None,
            CRYPTPROTECT_UI_FORBIDDEN,
            &mut out_blob,
        )
        .is_err()
        {
            return Ok(None);
        }

        let plain_slice =
            std::slice::from_raw_parts(out_blob.pbData, out_blob.cbData as usize).to_vec();
        let _ = LocalFree(HLOCAL(out_blob.pbData as _));
        let key = String::from_utf8(plain_slice).ok();
        Ok(key)
    }
}

#[tauri::command]
pub fn has_custom_api_key() -> bool {
    get_vault_file_path().exists()
}

#[tauri::command]
pub fn clear_custom_api_key() -> Result<bool, String> {
    let path = get_vault_file_path();
    if path.exists() {
        let _ = fs::remove_file(path);
    }
    Ok(false)
}
