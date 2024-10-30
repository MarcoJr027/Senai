async function Login() {
    const user = document.getElementById("usuario").value; // Mantém o id 'usuario'
    const senha = document.getElementById("senha").value;
    const errorMessage = document.getElementById("error-message");

    // Limpa a mensagem de erro anterior
    errorMessage.textContent = '';

    // Valida se os campos não estão vazios
    if (!user || !senha) {
        errorMessage.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        // Faz a requisição para a API de login
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario: user, senha: senha }), // Corrigido para 'usuario'
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message); // Mensagem de sucesso
            window.location.href = 'Pagina_Principal.html'; // Redireciona para a página do dashboard
        } else {
            const error = await response.json();
            errorMessage.textContent = error.error; // Exibe mensagem de erro
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        errorMessage.textContent = 'Erro ao tentar conectar ao servidor. Tente novamente mais tarde.';
    }

    // Limpa os campos após tentativa
    document.getElementById("usuario").value = '';
    document.getElementById("senha").value = '';
}

function mostrarOcultarSenha() {
    const senhaInput = document.getElementById("senha");
    const mostrarSenhaCheckbox = document.getElementById("mostrarSenhaCheckbox");
    senhaInput.type = mostrarSenhaCheckbox.checked ? "text" : "password";
}
