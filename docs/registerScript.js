document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = form.username.value;
        const password = form.password.value;
        const errorDiv = form.querySelector('.alert-danger');
        if (errorDiv) errorDiv.remove();

        try {
            const res = await fetch('/api/login/register/ui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccess('Yay, you now have an account!');
                form.reset();
            } else {
                showError(data.message || 'Registration failed.');
            }
        } catch (err) {
            showError('Network error. Please try again.');
        }
    });

    function showSuccess(msg) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success mt-2';
        successDiv.textContent = msg;
        form.parentNode.insertBefore(successDiv, form.nextSibling);
    }

    function showError(msg) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-2';
        errorDiv.textContent = msg;
        form.parentNode.insertBefore(errorDiv, form.nextSibling);
    }
});
