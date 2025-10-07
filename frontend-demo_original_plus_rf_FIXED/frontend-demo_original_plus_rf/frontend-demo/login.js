const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Alterna entre as seções de cadastro e login (protege caso elementos não existam)
if (signUpButton && container) {
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });
}

if (signInButton && container) {
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
}

// Helpers para storage e hashing
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Cadastro de usuário
const submitSignUp = document.getElementById('submitSignUp');
if (submitSignUp) {
    submitSignUp.addEventListener('click', async () => {
        const firstName = document.getElementById('firstName').value.trim()
        const email = document.getElementById('email').value.trim().toLowerCase();
        const cpf = document.getElementById('cpf').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;

        // Verificar se todos os campos foram preenchidos
        if (!firstName || !lastName || !email || !cpf || !birthDate || !gender || !phone || !password) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Validar o formato do CPF (exemplo simplificado)
        if (!/^\d{11}$/.test(cpf)) {
            alert("Por favor, insira um CPF válido (11 dígitos).");
            return;
        }

        // Validar e-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        // Política mínima de senha
        if (password.length < 8) {
            alert("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        const users = getUsers();
        if (users.some(u => u.email === email)) {
            alert("Já existe uma conta cadastrada com esse e-mail.");
            return;
        }

        const passwordHash = await hashPassword(password);

        const newUser = {
            firstName,
            lastName,
            email,
            cpf,
            birthDate,
            gender,
            phone,
            passwordHash,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Salvar sessão mock
        localStorage.setItem('currentUserEmail', email);
        localStorage.setItem('userName', firstName);

        alert("Cadastro concluído! Redirecionando...");
        window.location.href = 'index.html'; // Redireciona o usuário
    });
}

// Login do usuário
const submitLogin = document.getElementById('submitLogin');
if (submitLogin) {
    submitLogin.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        // Validação de campos obrigatórios
        if (!email || !password) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Validação do formato do e-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            alert("E-mail ou senha incorretos. Tente novamente.");
            return;
        }

        const passwordHash = await hashPassword(password);
        if (passwordHash === user.passwordHash) {
            // Recuperar nome do usuário do local storage
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('userName', user.firstName);
            alert(`Bem-vindo, ${user.firstName}!`);
            window.location.href = "index.html"; // Redireciona para a próxima página
        } else {
            alert("E-mail ou senha incorretos. Tente novamente.");
        }
    });
}

// Exibir nome e gerenciar logout no index.html
window.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutMenu = document.getElementById('logoutMenu');
    const logoutButton = document.getElementById('logoutButton');

    // Exibir o nome do usuário quando o elemento existir
    const userName = localStorage.getItem('userName');
    if (userName && userNameDisplay) {
        userNameDisplay.textContent = `Olá, ${userName}`;
    }

    // Alternar exibição do menu de logout (protege se elementos não existirem)
    if (userNameDisplay && logoutMenu) {
        userNameDisplay.addEventListener('click', () => {
            logoutMenu.style.display = logoutMenu.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Logout e redirecionamento
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('userName'); // Remove o nome do usuário
            localStorage.removeItem('currentUserEmail');
            alert("Você foi desconectado.");
            window.location.href = 'login.html'; // Redireciona para a página de login
        });
    }

    // Fechar o menu ao clicar fora (protege se logoutMenu não existir)
    if (logoutMenu && userNameDisplay) {
        document.addEventListener('click', (event) => {
            if (!logoutMenu.contains(event.target) && event.target !== userNameDisplay) {
                logoutMenu.style.display = 'none';
            }
        });
    }
});
