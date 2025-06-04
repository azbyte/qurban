const API_BASE_URL = 'response.json';

let activePage = 'page-home';
let reportChartInstance = null;

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const showModal = (title, message, isSuccess = true) => {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;

    const iconContainer = document.getElementById('modal-icon-container');
    const button = document.getElementById('modal-button');
    
    if(isSuccess) {
        iconContainer.className = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10';
        iconContainer.innerHTML = `<svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
        button.className = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm';
    } else {
        iconContainer.className = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10';
        iconContainer.innerHTML = `<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
        button.className = 'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm';
    }
    
    modal.classList.remove('hidden-view');
};

const closeModal = () => {
    document.getElementById('modal').classList.add('hidden-view');
};

const showPage = (pageId) => {
    document.getElementById(activePage).classList.add('hidden-view');
    document.getElementById(pageId).classList.remove('hidden-view');
    activePage = pageId;
    
    if(pageId === 'page-admin-dashboard'){
        populatePesertaSelect();
        showAdminTab('tab-input');
    }
    if(pageId === 'page-home'){
        updateDashboardStats();
    }
};

const showAdminTab = (tabId) => {
    const inputTab = document.getElementById('tab-input');
    const reportTab = document.getElementById('tab-report');
    const btnInput = document.getElementById('btn-input');
    const btnReport = document.getElementById('btn-report');

    inputTab.classList.add('hidden-view');
    reportTab.classList.add('hidden-view');
    btnInput.classList.remove('border-green-700', 'text-green-700');
    btnReport.classList.remove('border-green-700', 'text-green-700');
    btnInput.classList.add('text-gray-500', 'border-transparent');
    btnReport.classList.add('text-gray-500', 'border-transparent');

    if (tabId === 'tab-input') {
        inputTab.classList.remove('hidden-view');
        btnInput.classList.add('border-green-700', 'text-green-700');
        btnInput.classList.remove('text-gray-500', 'border-transparent');
    } else {
        reportTab.classList.remove('hidden-view');
        btnReport.classList.add('border-green-700', 'text-green-700');
        btnReport.classList.remove('text-gray-500', 'border-transparent');
        renderReport();
    }
};

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const newPeserta = {
        nama_peserta: formData.get('nama_peserta'),
        nip_nidn: formData.get('nip_nidn'),
        email: formData.get('email'),
        nomor_telepon: formData.get('nomor_telepon'),
        alamat: formData.get('alamat'),
        tanggal_daftar: new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch(`${API_BASE_URL}?path=peserta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPeserta)
        });
        const result = await response.json();
        if (result.success) {
            form.reset();
            showModal('Pendaftaran Berhasil', 'Terima kasih, data Anda telah berhasil kami simpan. Anda akan diarahkan kembali ke halaman utama.', true);
            showPage('page-home');
        } else {
            showModal('Pendaftaran Gagal', result.error || 'Terjadi kesalahan saat menyimpan data.', false);
        }
    } catch (error) {
        showModal('Pendaftaran Gagal', 'Terjadi kesalahan jaringan.', false);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user === 'admin' && pass === 'admin123') {
        showPage('page-admin-dashboard');
    } else {
        showModal('Login Gagal', 'Username atau password salah.', false);
    }
}

async function fetchPeserta() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.peserta || [];
    } catch (error) {
        showModal('Error', 'Gagal mengambil data peserta.', false);
        return [];
    }
}

async function fetchPotongan() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.potongan || [];
    } catch (error) {
        showModal('Error', 'Gagal mengambil data potongan.', false);
        return [];
    }
}

async function populatePesertaSelect() {
    const select = document.getElementById('id_peserta');
    select.innerHTML = '<option value="">-- Pilih Peserta --</option>';
    const peserta = await fetchPeserta();
    const potongan = await fetchPotongan();

    peserta.forEach(p => {
        if (!potongan.some(pot => pot.id_peserta === p.id)) {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nama_peserta} (NIP/NIDN: ${p.nip_nidn})`;
            select.appendChild(option);
        }
    });
}

function calculateMonthly() {
    const total = document.getElementById('nilai_qurban_estimasi').value;
    const monthly = total ? total / 12 : 0;
    document.getElementById('monthly-deduction').textContent = formatRupiah(monthly);
}

async function handleDeduction(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const id_peserta = parseInt(formData.get('id_peserta'));
    const nilai_qurban_estimasi = parseFloat(formData.get('nilai_qurban_estimasi'));

    if(!id_peserta || !nilai_qurban_estimasi){
        showModal('Input Tidak Valid', 'Mohon pilih peserta dan isi nilai estimasi qurban.', false);
        return;
    }

    const newPotongan = {
        id_peserta: id_peserta,
        nilai_qurban_estimasi: nilai_qurban_estimasi,
        tanggal_input: new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch(`${API_BASE_URL}?path=potongan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPotongan)
        });
        const result = await response.json();
        if (result.success) {
            form.reset();
            calculateMonthly();
            populatePesertaSelect();
            showModal('Data Disimpan', 'Data potongan gaji telah berhasil disimpan.', true);
        } else {
            showModal('Gagal Menyimpan', result.error || 'Terjadi kesalahan saat menyimpan data potongan.', false);
        }
    } catch (error) {
        showModal('Gagal Menyimpan', 'Terjadi kesalahan jaringan.', false);
    }
}

async function renderReport() {
    const tableBody = document.getElementById('report-table-body');
    tableBody.innerHTML = '';
    let grandTotal = 0;

    const potongan = await fetchPotongan();
    const peserta = await fetchPeserta();

    const reportData = potongan.map((pot, index) => {
        const p = peserta.find(pes => pes.id === pot.id_peserta);
        if (!p) return null;

        const totalPotongan = parseFloat(pot.nilai_qurban_estimasi);
        grandTotal += isNaN(totalPotongan) ? 0 : totalPotongan;
        return {
            no: index + 1,
            nama: p.nama_peserta,
            nip: p.nip_nidn,
            total: isNaN(totalPotongan) ? 0 : totalPotongan
        };
    }).filter(Boolean);

    reportData.forEach(data => {
        const row = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${data.no}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${data.nama}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${data.nip}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">${formatRupiah(data.total)}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById('report-total').textContent = formatRupiah(grandTotal);
    renderReportChart(reportData);
}

function renderReportChart(data) {
    const ctx = document.getElementById('reportChart').getContext('2d');
    if (reportChartInstance) {
        reportChartInstance.destroy();
    }

    const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 10);
    const labels = sortedData.map(d => d.nama);
    const values = sortedData.map(d => d.total);

    reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Potongan Qurban (Rp)',
                data: values,
                backgroundColor: 'rgba(22, 163, 74, 0.7)',
                borderColor: 'rgba(21, 128, 61, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000000) + ' Jt';
                        }
                    }
                },
                x: {
                    ticks: {
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.substring(0, 15) + '...' : label;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Grafik 10 Besar Peserta Qurban Berdasarkan Total Potongan',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatRupiah(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

async function updateDashboardStats() {
    const potongan = await fetchPotongan();
    document.getElementById('stats-total-peserta').textContent = potongan.length;
    const totalDana = potongan.reduce((sum, pot) => sum + parseFloat(pot.nilai_qurban_estimasi), 0);
    document.getElementById('stats-total-dana').textContent = formatRupiah(totalDana);
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
});
