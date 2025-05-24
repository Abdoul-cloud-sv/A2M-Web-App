// Vérification de l'authentification et du rôle
async function initAdmin() {
    const user = await checkAuth()
    if (!user || user.role !== 'admin') {
        window.location.href = '/login.html'
        return
    }

    // Afficher l'email de l'utilisateur
    document.getElementById('userEmail').textContent = user.email

    // Charger la liste des utilisateurs
    loadUsers()
}

// Chargement des utilisateurs
async function loadUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        const tableBody = document.getElementById('usersTableBody')
        tableBody.innerHTML = ''

        users.forEach(user => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <span class="status-badge ${user.status}">
                        ${user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="toggleUserStatus('${user.id}', '${user.status}')" class="action-button">
                        <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" class="action-button delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tableBody.appendChild(row)
        })
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        alert('Erreur lors du chargement des utilisateurs')
    }
}

// Gestion du modal d'ajout d'utilisateur
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex'
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none'
    document.getElementById('addUserForm').reset()
}

// Création d'un nouvel utilisateur
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('newUserEmail').value
    const password = document.getElementById('newUserPassword').value
    const role = document.getElementById('newUserRole').value
    const status = document.getElementById('newUserStatus').value

    try {
        // Créer l'utilisateur dans l'authentification
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        })

        if (authError) throw authError

        // Ajouter l'utilisateur dans la table users
        const { error: userError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    role,
                    status
                }
            ])

        if (userError) throw userError

        // Fermer le modal et recharger la liste
        closeAddUserModal()
        loadUsers()
        alert('Utilisateur créé avec succès')

    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error)
        alert('Erreur lors de la création de l\'utilisateur')
    }
})

// Changement du statut d'un utilisateur
async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('id', userId)

        if (error) throw error

        loadUsers()
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        alert('Erreur lors du changement de statut')
    }
}

// Suppression d'un utilisateur
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId)

        if (error) throw error

        loadUsers()
    } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de l\'utilisateur')
    }
}

// Gestion du menu mobile
document.getElementById('menu-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active')
})

// Initialisation
initAdmin() 