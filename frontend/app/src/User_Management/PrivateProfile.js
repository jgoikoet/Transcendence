export function initProfile() 
{
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.user_id) 
        loadAvatar(userData.user_id);
    loadProfileData();
    setup2FAHandlers();
    setupAvatarHandlers(loadProfileData);
    setupFormHandlers();
}

function loadAvatar(userId) 
{
    const avatarImage = document.getElementById('avatarImage');
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
    const avatarUrl = `${baseUrl}/user_management/api/users/avatar/${userId}/?${new Date().getTime()}`;
    avatarImage.src = avatarUrl;
    avatarImage.onerror = function() 
    {
        this.src = 'img/avatar.jpg';
        this.onerror = null;
    };
}

async function loadProfileData() 
{
    const token = localStorage.getItem('accessToken');
    if (!token) 
        return;
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/profile/`, 
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) 
        {
            const profileData = await response.json();
            updateProfileUI(profileData);
        } 
        else 
        {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${errorData}`);
        }
    } 
    catch (error)
    {
        alert('Error fetching profile data. Please try again.');
    }
}

function updateProfileUI(profileData) 
{
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage && profileData.avatar_image) 
    {
		const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
		avatarImage.src = `${baseUrl}/user_management/api/users/avatar/${profileData.id}/`;
    }
    const usernameField = document.getElementById('username');
    if (usernameField) 
        usernameField.textContent = profileData.username;
    const displayField = document.getElementById('display_name');
    if (displayField)
        displayField.value = profileData.display_name || '';
    const joinedField = document.getElementById('date_joined');
    if (joinedField) 
    {
        const date = new Date(profileData.date_joined);
        const formattedDate = date.toLocaleString();
        joinedField.textContent = formattedDate;
    }
    const firstNameField = document.getElementById('first_name');
    if (firstNameField) 
        firstNameField.value = profileData.first_name || '';
    const lastNameField = document.getElementById('last_name');
    if (lastNameField) 
        lastNameField.value = profileData.last_name || '';
    updateTwoFAStatus(profileData.two_factor_enabled);
}

function updateTwoFAStatus(isEnabled) 
{
    const statusElement = document.getElementById('twoFAStatus');
    const toggleButton = document.getElementById('toggle2FA');
    if (statusElement) 
        statusElement.textContent = isEnabled ? '2FA is currently enabled.' : '2FA is currently disabled.';
    if (toggleButton)
        toggleButton.textContent = isEnabled ? 'Disable 2FA' : 'Enable 2FA';
}

function setup2FAHandlers() 
{
    const toggleButton = document.getElementById('toggle2FA');
    if (toggleButton) 
    {
        toggleButton.addEventListener('click', async () => {
            const isCurrentlyEnabled = toggleButton.textContent === 'Disable 2FA';
            const url = isCurrentlyEnabled ? 'auth/disable-2fa/' : 'auth/enable-2fa/';
            try 
            {
                const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
                const response = await fetch(`${baseUrl}/user_management/api/${url}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) 
                {
                    const result = await response.json();
                    if (!isCurrentlyEnabled && result.qr_code) 
                        showQRCode(result.qr_code);
                    else 
                    {
                        updateTwoFAStatus(!isCurrentlyEnabled);
                        document.getElementById('qrCodeContainer').style.display = 'none';
                    }
                } 
                else 
                {
                    throw new Error('Failed to toggle 2FA');
                }
            } 
            catch (error) 
            {
                alert('Error setting 2FA options. Please try again.');
            }
        });
    }
}

function showQRCode(qrCode) 
{
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = `
        <img src="data:image/png;base64,${qrCode}" alt="2FA QR Code">
        <p>Scan this QR code with Google Authenticator app</p>
        <input type="text" id="verificationCode" placeholder="Enter verification code">
        <button id="verifyCode">Verify</button>
    `;
    qrCodeContainer.style.display = 'block';

    document.getElementById('verifyCode').addEventListener('click', verify2FA);
}

async function verify2FA() 
{
    const code = document.getElementById('verificationCode').value;
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/verify-2fa/`, 
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        if (response.ok) 
        {
            updateTwoFAStatus(true);
            document.getElementById('qrCodeContainer').style.display = 'none';
        } 
        else 
        {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${errorData}`);
        }
    } 
    catch (error)
    {
        alert('Error verifying 2FA. Please try again.');
    }
}

function setupAvatarHandlers(loadProfileDataCallback) 
{
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    if (changeAvatarBtn && avatarInput) 
    {
        if (!changeAvatarBtn.hasAttribute('data-listener-attached')) 
        {
            changeAvatarBtn.addEventListener('click', () => avatarInput.click());
            changeAvatarBtn.setAttribute('data-listener-attached', 'true');
        }
        if (!avatarInput.hasAttribute('data-listener-attached')) 
        {
            avatarInput.addEventListener('change', function(event) 
            {
                uploadAvatar.call(this, loadProfileDataCallback);
            });
            avatarInput.setAttribute('data-listener-attached', 'true');
        }
    }
}

async function uploadAvatar(onSuccessCallback) 
{
    const file = this.files[0];
    if (file) 
    {
        const formData = new FormData();
        formData.append('avatar_image', file);
        try 
        {
            const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
            const response = await fetch(`${baseUrl}/user_management/api/auth/users/upload-avatar/`, 
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData
            });
            if (response.ok) 
            {
                if (typeof onSuccessCallback === 'function') 
                    onSuccessCallback();
            } 
            else 
            {
                throw new Error('Failed to upload avatar');
            }
        } 
        catch (error) 
        {
            alert('Error uploading avatar. Please try again.');
        }
    }
}

function setupFormHandlers() 
{
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changeProfileBtn = document.getElementById('changeProfilelBtn');
    const submitPasswordChange = document.getElementById('submitPasswordChange');
    const submitProfileChange = document.getElementById('submitProfileChange');
    changePasswordBtn.removeEventListener('click', toggleForm);
    changeProfileBtn.removeEventListener('click', toggleForm);
    submitPasswordChange.removeEventListener('click', changePassword);
    submitProfileChange.removeEventListener('click', updateProfile);
    changePasswordBtn.addEventListener('click', toggleForm);
    changeProfileBtn.addEventListener('click', toggleForm);
    submitPasswordChange.addEventListener('click', changePassword);
    submitProfileChange.addEventListener('click', updateProfile);
}

function toggleForm(event) 
{
    event.preventDefault();
    event.stopPropagation();
    const passwordForm = document.getElementById('changePasswordForm');
    const profileForm = document.getElementById('changeProfileForm');
    const passwordBtn = document.getElementById('changePasswordBtn');
    const profileBtn = document.getElementById('changeProfilelBtn');
    const clickedButton = event.currentTarget;
    const isPasswordBtn = clickedButton.id === 'changePasswordBtn';
    passwordForm.style.display = 'none';
    profileForm.style.display = 'none';
    if (isPasswordBtn) 
    {
        passwordForm.style.display = 'block';
        passwordBtn.classList.add('active');
        profileBtn.classList.remove('active');
    } 
    else 
    {
        profileForm.style.display = 'block';
        profileBtn.classList.add('active');
        passwordBtn.classList.remove('active');
    }
}

async function changePassword(event) 
{
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    if (newPassword !== confirmNewPassword) 
    {
        alert('New passwords do not match!');
        return;
    }
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/change-password/`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        if (response.ok) 
        {
            alert('Password changed successfully!');
            window.history.pushState({}, "", "/PrivateProfile");
            window.dispatchEvent(new PopStateEvent('popstate'));
            window.dispatchEvent(new Event('locationchange'));
        } 
        else 
        {
            const errorData = await response.json();
            throw new Error(`Failed to change password: ${errorData.error}`);
        }
    } 
    catch (error) 
    {
        alert('An error occurred while changing the password.');
    }
}

async function updateProfile(event) 
{
    event.preventDefault();
    const submitButton = event.target;
    submitButton.disabled = true;
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const display_name = document.getElementById('display_name').value;
    try 
    {
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:49998`;
        const response = await fetch(`${baseUrl}/user_management/api/auth/users/update-profile/`, 
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                first_name,
                last_name,
                display_name
            })
        });
        if (response.ok) 
        {
            const updatedData = await response.json();
            localStorage.setItem('accessToken', updatedData.access);
            localStorage.setItem('refreshToken', updatedData.refresh);
            loadProfileData();
        } 
        else 
        {
            const errorData = await response.text();
            throw new Error(`Failed to update profile: ${errorData}`);
        }
    } 
    catch (error) 
    {
        alert('Error updating user profile. Please try again.');
    } 
    finally 
    {
        submitButton.disabled = false;
    }
}
