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

// Helpers para storage compatível com o restante da aplicação (com suporte a legado)
function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

function safeParseList(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function getStoredUsers() {
    return safeParseList('mg_users');
}

function getLegacyUsers() {
    return safeParseList('users');
}

function saveUsers(users) {
    localStorage.setItem('mg_users', JSON.stringify(users));
}

function createHandle(name) {
    const base = (name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '')
        .toLowerCase();
    return base ? `@${base}` : `@user${Date.now()}`;
}

function getUsers() {
    const map = new Map();

    getStoredUsers().forEach(user => {
        const email = normalizeEmail(user.email);
        if (!email) return;
        map.set(email, {
            ...user,
            email,
            instruments: Array.isArray(user.instruments) ? user.instruments : [],
            genres: Array.isArray(user.genres) ? user.genres : [],
            following: Array.isArray(user.following) ? user.following : []
        });
    });

    getLegacyUsers().forEach((legacyUser, index) => {
        const email = normalizeEmail(legacyUser.email);
        if (!email || map.has(email)) return;
        const name = legacyUser.name || legacyUser.firstName || email.split('@')[0];
        map.set(email, {
            id: legacyUser.id || legacyUser.createdAt || `legacy-${index}`,
            email,
            pass: legacyUser.pass,
            passwordHash: legacyUser.passwordHash,
            name,
            handle: legacyUser.handle || createHandle(name || email.split('@')[0]),
            cpf: legacyUser.cpf || '',
            phone: legacyUser.phone || '',
            bio: legacyUser.bio || '',
            avatar: legacyUser.avatar || '',
            instruments: Array.isArray(legacyUser.instruments) ? legacyUser.instruments : [],
            genres: Array.isArray(legacyUser.genres) ? legacyUser.genres : [],
            following: Array.isArray(legacyUser.following) ? legacyUser.following : []
        });
    });

    return Array.from(map.values());
}

function persistUserSnapshot(user) {
    const email = normalizeEmail(user.email);
    if (!email) return null;

    const users = getStoredUsers();
    const idx = users.findIndex(u => normalizeEmail(u.email) === email);
    const existing = idx >= 0 ? users[idx] : {};
    const name = user.name ?? existing.name ?? email.split('@')[0];

    const record = {
        id: user.id ?? existing.id ?? Date.now(),
        email,
        pass: user.pass ?? existing.pass ?? '',
        passwordHash: user.passwordHash ?? existing.passwordHash ?? '',
        name,
        handle: user.handle ?? existing.handle ?? createHandle(name || email.split('@')[0]),
        cpf: user.cpf ?? existing.cpf ?? '',
        phone: user.phone ?? existing.phone ?? '',
        bio: user.bio ?? existing.bio ?? '',
        avatar: user.avatar ?? existing.avatar ?? '',
        instruments: Array.isArray(user.instruments) ? user.instruments : (Array.isArray(existing.instruments) ? existing.instruments : []),
        genres: Array.isArray(user.genres) ? user.genres : (Array.isArray(existing.genres) ? existing.genres : []),
        following: Array.isArray(user.following) ? user.following : (Array.isArray(existing.following) ? existing.following : [])
    };

    if (idx >= 0) {
        users[idx] = record;
    } else {
        users.push(record);
    }

    saveUsers(users);
    return record;
}

async function hashPassword(password) {
    if (!password) return '';
    if (window.crypto?.subtle) {
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return password;
}

// Cadastro de usuário
const submitSignUp = document.getElementById('submitSignUp');
if (submitSignUp) {
    submitSignUp.addEventListener('click', async () => {
        const firstNameInput = document.getElementById('firstName');
        const emailInput = document.getElementById('email');
        const cpfInput = document.getElementById('cpf');
        const phoneInput = document.getElementById('phone');
        const passwordInput = document.getElementById('password');

        const firstName = firstNameInput ? firstNameInput.value.trim() : '';
        const email = normalizeEmail(emailInput ? emailInput.value : '');
        const cpf = cpfInput ? cpfInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        // Verificar se todos os campos foram preenchidos
        if (!firstName || !email || !cpf || !phone || !password) {
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
            id: Date.now(),
            email,
            pass: password,
            passwordHash,
            name: firstName,
            handle: createHandle(firstName || email.split('@')[0]),
            cpf,
            phone,
            bio: '',
            avatar: '',
            instruments: [],
            genres: [],
            following: []
        };

        const persisted = persistUserSnapshot(newUser) || newUser;

        // Salvar sessão mock
        localStorage.setItem('mg_currentUser', String(persisted.id));

        alert("Cadastro concluído! Redirecionando...");
        window.location.href = 'feed.html'; // Redireciona o usuário para o app
    });
}

// Login do usuário
const submitLogin = document.getElementById('submitLogin');
if (submitLogin) {
    submitLogin.addEventListener('click', async () => {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        const email = normalizeEmail(emailInput ? emailInput.value : '');
        const password = passwordInput ? passwordInput.value : '';

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

        let authenticated = false;
        let passwordHashComputed = '';

        if (user.pass && user.pass === password) {
            authenticated = true;
            passwordHashComputed = user.passwordHash || '';
        }

        if (!authenticated && user.passwordHash) {
            passwordHashComputed = await hashPassword(password);
            if (passwordHashComputed === user.passwordHash) {
                authenticated = true;
            }
        }

        if (!authenticated) {
            alert("E-mail ou senha incorretos. Tente novamente.");
            return;
        }

        if (!passwordHashComputed) {
            passwordHashComputed = await hashPassword(password);
        }

        const persisted = persistUserSnapshot({
            ...user,
            pass: password,
            passwordHash: passwordHashComputed
        }) || user;

        localStorage.setItem('mg_currentUser', String(persisted.id));
        alert(`Bem-vindo, ${persisted.name || persisted.email}!`);
        window.location.href = "feed.html"; // Redireciona para a próxima página
    });
}

// Atualizar o CTA de logout quando a página possuir o botão
window.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (!logoutButton) return;

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('mg_currentUser');
        alert("Você foi desconectado.");
        window.location.href = 'index.html';
    });
});
