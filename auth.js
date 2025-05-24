// Configuration Supabase
const SUPABASE_URL = 'https://xjybsycdnrvprgdmptvj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeWJzeWNkbnJ2cHJnZG1wdHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI2NDUsImV4cCI6MjA2MzY2ODY0NX0.drU_XKDmQnDdM5nrmhfU3V3Y9Ca_TMUfM90BWkqJrzs'

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Gestion du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const errorMessage = document.getElementById('error-message')
    const loginButton = document.querySelector('.login-button')
    
    try {
        // Désactiver le bouton pendant la connexion
        loginButton.disabled = true
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...'
        
        // Tentative de connexion
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error

        // Récupération des informations de l'utilisateur
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, status')
            .eq('id', data.user.id)
            .single()

        if (userError) throw userError

        // Vérification du statut de l'utilisateur
        if (userData.status === 'inactive') {
            errorMessage.textContent = 'Votre compte est inactif. Veuillez contacter l\'administrateur.'
            return
        }

        // Stockage des informations de session
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: userData.role
        }))

        // Redirection selon le rôle
        if (userData.role === 'admin') {
            window.location.href = 'admin.html'
        } else {
            window.location.href = 'user.html'
        }

    } catch (error) {
        console.error('Erreur de connexion:', error)
        errorMessage.textContent = 'Identifiants invalides.'
    } finally {
        // Réactiver le bouton
        loginButton.disabled = false
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter'
    }
})

// Vérification de la session au chargement de la page
async function checkSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
            const user = JSON.parse(localStorage.getItem('user'))
            if (user) {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'user.html'
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error)
    }
}

// Fonction de déconnexion
async function logout() {
    try {
        await supabase.auth.signOut()
        localStorage.removeItem('user')
        window.location.href = 'login.html'
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

// Vérification de l'authentification pour les pages protégées
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        window.location.href = 'login.html'
        return
    }

    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
        window.location.href = 'login.html'
        return
    }

    return user
}

// Exécution de la vérification au chargement
checkSession() 