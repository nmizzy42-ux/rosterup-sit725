    document.addEventListener('DOMContentLoaded', () => {
        loadPendingRequests();
    });

    async function loadPendingRequests() {
        const loading = document.getElementById('loadingState');
        const tableWrapper = document.getElementById('tableWrapper');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('requestsTableBody');

        try {
            const response = await fetch('/api/manager/pending-employees');
            const data = await response.json();

            loading.classList.add('hidden');

            if (response.ok && data.success && data.employees.length > 0) {
                tbody.innerHTML = '';

                data.employees.forEach(emp => {
                    const row = document.createElement('tr');
                    row.id = `user-row-${emp._id}`;
                    row.innerHTML = `
          <td><strong>${emp.first_name} ${emp.last_name}</strong></td>
          <td>${emp.email}</td>
          <td><span class="badge-role">${emp.role.toUpperCase()}</span></td>
          <td class="center-align actions-cell">
            <button onclick="processRequest('${emp._id}', 'approve')" class="btn-approve">
              Approve
            </button>
            <button onclick="processRequest('${emp._id}', 'reject')" class="btn-reject">
              Reject
            </button>
          </td>
        `;
                    tbody.appendChild(row);
                });

                tableWrapper.classList.remove('hidden');
                emptyState.classList.add('hidden');
            } else {
                tableWrapper.classList.add('hidden');
                emptyState.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Data pull interaction processing error:', err);
            loading.classList.add('hidden');
            showGlobalMessage('Failed to download registration requests from the server.', 'error');
        }
    }

    async function processRequest(userId, action) {
        const buttons = document.querySelectorAll(`#user-row-${userId} button`);
        buttons.forEach(btn => btn.disabled = true);

        try {
            const response = await fetch(`/api/manager/process-employee/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showGlobalMessage(`Successfully ${action}d ${data.employeeName}.`, 'success');

                const targetRow = document.getElementById(`user-row-${userId}`);
                targetRow.remove();

                const tbody = document.getElementById('requestsTableBody');
                if (tbody.children.length === 0) {
                    document.getElementById('tableWrapper').classList.add('hidden');
                    document.getElementById('emptyState').classList.remove('hidden');
                }
            } else {
                showGlobalMessage(data.message || 'Could not execute requested state mutations.', 'error');
                buttons.forEach(btn => btn.disabled = false);
            }
        } catch (err) {
            console.error('Backend pipeline connection error context:', err);
            showGlobalMessage('Network timeout. Update process failed.', 'error');
            buttons.forEach(btn => btn.disabled = false);
        }
    }

    function showGlobalMessage(text, type) {
        const box = document.getElementById('globalMessage');
        box.textContent = text;
        box.className = `alert-box alert-${type}`;

        setTimeout(() => {
            box.classList.add('hidden');
        }, 4000);
    }
