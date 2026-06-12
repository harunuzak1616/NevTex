console.log("APP.JS YÜKLENDİ");
const supabaseUrl = 'https://laksjzketaxelkzquvht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha3NqemtldGF4ZWxrenF1dmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDI2NzUsImV4cCI6MjA5MjUxODY3NX0.PxA_97pYXvGV5dxR6ZEWngrqfYakntqKE8EqRTNO5WE';
let supabaseClient = null;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error("Supabase SDK yüklenemedi. İnternet bağlantınızı veya reklam engelleyicinizi kontrol edin.");
        alert("Sistem kritik bir hata aldı: Supabase SDK yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya sayfayı yenileyin.");
    }
} catch (e) {
    console.error("Supabase başlatma hatası:", e);
    alert("Supabase bağlantısı kurulamadı: " + e.message);
}
const mockData = {
    users: [],
    personnel: [],
    studies: [],
    orders: [],
    settingsOperations: [],
    lots: [],
    personnelHistory: [],
    firms: [],
    systemLogs: [],
    sharedFiles: [],
    chatMessages: []
};

// window.onerror removed for stability

console.log("Nev Tex Pro JS Başlatılıyor...");

// --- Critical Work-Study Global Functions ---
window.filterOperationsByPlan = function(isAutoRefresh = false) {
    const orderId = document.getElementById('study-model')?.value;
    const opSelect = document.getElementById('study-operation');
    const infoPanel = document.getElementById('study-info-panel');
    if (!opSelect) return;
    opSelect.innerHTML = '<option value="">Operasyon Seçin</option>';
    if (infoPanel) infoPanel.style.display = 'none';
    
    if (!orderId) return;
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    console.log("🔍 Teşhis Başlatıldı - Model ID:", orderId, "Veri:", order);
    
    if (order) {
        let ops = order.operations || [];
        if (typeof ops === 'string') {
            try { ops = JSON.parse(ops); } catch(e) { ops = []; }
        }
        
        if (ops.length > 0) {
            ops.forEach(op => {
                const typeText = op.type === 'finish' ? '[ÇIKIŞ]' : '[Normal]';
                opSelect.innerHTML += `<option value="${op.id}" data-target="${op.target}" data-name="${op.name}">${op.name} | ${op.category} | H: ${op.target} | ${typeText}</option>`;
            });
            if (!isAutoRefresh) {
                console.log(`✅ Başarılı: ${order.model} için ${ops.length} operasyon listelendi.`);
            }
        } else {
            console.warn("⚠️ Model için operasyon planı bulunamadı.");
            if (!isAutoRefresh) {
                alert(`⚠️ Dikkat: "${order.model}" için henüz bir etüt planı oluşturulmamış veya kaydedilmemiş.\n\nLütfen 1. Sayfaya (Etüt Planı) giderek bu model için operasyonları ekleyin ve "Planı Kaydet" butonuna basın.`);
            }
        }
    } else {
        if (!isAutoRefresh) {
            alert("❌ Hata: Seçilen model sistem hafızasında bulunamadı. Lütfen 'Verileri Yenile' butonuna basın.");
        }
    }
}

window.saveWorkStudyData = async function() {
    const btn = document.querySelector('button[onclick="saveWorkStudyData()"]');
    if (btn) btn.disabled = true;
    
    console.log("Saving Work-Study data via Global Handler...");
    try {
        const orderId = document.getElementById('study-model').value;
        const personnelId = document.getElementById('study-personnel').value;
        const operationId = document.getElementById('study-operation').value;
        const actualValue = document.getElementById('study-actual').value;
        const actual = parseInt(actualValue) || 0;
        const firmId = currentUser ? currentUser.firmId : null;

        if (!orderId || !personnelId || !operationId || !actualValue) {
            alert("Lütfen tüm alanları (Model, Personel, Operasyon ve Adet) doldurun.");
            if (btn) btn.disabled = false;
            return;
        }

        const order = mockData.orders.find(o => String(o.id) === String(orderId));
        const modelName = order ? `${order.customer} - ${order.model}` : "Bilinmeyen Model";
        
        const opSelect = document.getElementById('study-operation');
        const opOption = opSelect.options[opSelect.selectedIndex];
        const opName = opOption ? opOption.dataset.name : "Bilinmeyen Operasyon";
        const target = opOption ? parseInt(opOption.dataset.target) || 0 : 0;

        const pSelect = document.getElementById('study-personnel');
        const pName = pSelect && pSelect.selectedIndex > 0 ? pSelect.options[pSelect.selectedIndex].text.split(' (')[0] : "Bilinmeyen Personel";

        // Supabase tablosunda personel_adi sütunu olmadığı için, operation_name içine paketliyoruz.
        const opNameDB = pName + "|||" + opName;
        
        // Tarih ve Saat Dilimi Birleştirme
        const selectedDate = document.getElementById('study-date').value; // YYYY-MM-DD
        const selectedInterval = document.getElementById('study-time-interval').value; // "10:00 - 11:00"
        const startTime = selectedInterval.split(' - ')[0]; // "10:00"
        
        // Geçerli bir Date objesi oluştur (Tarih + Başlangıç Saati)
        const combinedDateTime = new Date(`${selectedDate}T${startTime}:00`);

        const { error } = await supabaseClient.from('time_studies').insert({
            time: combinedDateTime.toISOString(),
            model_name: modelName,
            operation_name: opNameDB,
            efficiency: actual, // Girdiğiniz adet
            cycle_time: target, // Saatlik hedef
            firm_id: firmId
        });
        
        if (error) throw error;
        
        await loadData();
        renderWorkStudyRecords();
        renderOverviewCharts();
        
        // Reset fields
        document.getElementById('study-actual').value = '';
        const infoPanel = document.getElementById('study-info-panel');
        if (infoPanel) infoPanel.style.display = 'none';
        
        alert("✅ Veri girişi başarıyla kaydedildi.");
    } catch (err) { 
        console.error("Save Error:", err);
        alert("❌ Kayıt Hatası: " + err.message); 
    } finally {
        if (btn) btn.disabled = false;
    }
}

window.refreshWorkStudyData = async function() {
    try {
        const btn = document.querySelector('button[onclick="refreshWorkStudyData()"]');
        const icon = btn ? btn.querySelector('i') : null;
        const modelSelect = document.getElementById('study-model');
        const selectedModelId = modelSelect ? modelSelect.value : "";
        
        if(icon) icon.classList.add('fa-spin');
        if(btn) btn.disabled = true;
        
        console.log("🚀 Veri Yenileme Başlatıldı...");
        
        await loadData();
        
        populateModelSelects();
        renderWorkStudyRecords();
        
        if (selectedModelId) {
            window.filterOperationsByPlan(true); 
            const order = mockData.orders.find(o => String(o.id) === String(selectedModelId));
            const opCount = (order && order.operations) ? order.operations.length : 0;
            alert(`✅ Veriler Yenilendi!\n\nSeçili modeliniz (${order ? order.model : "Bilinmiyor"}) için kütüphaneden ${opCount} adet operasyon başarıyla çekildi.`);
        } else {
            const count = mockData.orders ? mockData.orders.length : 0;
            alert(`✅ Veriler Yenilendi!\n\nBuluttan toplam ${count} adet model güncellendi.`);
        }
    } catch(e) {
        console.error("Yenileme hatası:", e);
        alert("❌ Yenileme sırasında hata: " + e.message);
    } finally {
        const btn = document.querySelector('button[onclick="refreshWorkStudyData()"]');
        const icon = btn ? btn.querySelector('i') : null;
        if(icon) icon.classList.remove('fa-spin');
        if(btn) btn.disabled = false;
    }
}

function renderWorkStudyRecords() {
    const tbody = document.getElementById('study-records');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Sort by date desc
    const sorted = [...(mockData.studies || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    getFiltered(sorted).slice(0, 15).forEach(s => {
        let actual = s.efficiency || 0;
        let target = s.cycle_time || 0;
        let efficiencyPct = target > 0 ? Math.round((actual / target) * 100) : 0;
        
        let badgeClass = 'badge-danger';
        if (efficiencyPct >= 90.01) badgeClass = 'badge-success';
        else if (efficiencyPct >= 70.01) badgeClass = 'badge-warning';

        // Format selected date/time correctly
        let dt = s.time ? new Date(s.time) : new Date(s.created_at || Date.now());
        let dateStr = dt.toLocaleDateString('tr-TR');
        let timeStr = dt.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

        tbody.innerHTML += `
            <tr>
                <td><strong>${s.personnel_name || '-'}</strong></td>
                <td>${s.model || '-'}</td>
                <td>${s.operation || '-'}</td>
                <td>${target}</td>
                <td style="font-weight:700; color:var(--secondary);">${actual}</td>
                <td><span class="badge ${badgeClass}">%${efficiencyPct}</span></td>
                <td><small>${dateStr} - ${timeStr}</small></td>
                <td><button type="button" class="btn-danger" style="padding:4px 8px; font-size:0.7rem;" onclick="deleteWorkStudy('${s.id}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
}
window.renderWorkStudyRecords = renderWorkStudyRecords; // Global access

window.deleteWorkStudy = async function(id) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz? (İlgili grafikten de veriler düşülecektir)")) return;
    
    try {
        const { error } = await supabaseClient.from('time_studies').delete().eq('id', id);
        if (error) throw error;
        
        await loadData();
        renderWorkStudyRecords();
        renderOverviewCharts();
    } catch (e) {
        alert("Silme işlemi başarısız: " + e.message);
    }
}

// --- Work-Study Plan & Entry Logic (Global) ---
window.openAddOpToPlanModal = function() {
    console.log("openAddOpToPlanModal tetiklendi");
    const modal = document.getElementById('add-op-to-plan-modal');
    if (!modal) {
        alert("Pop-up penceresi bulunamadı! (Hata Kodu: M-01)");
        return;
    }
    const opSelect = document.getElementById('pop-op-name');
    if (opSelect && mockData.settingsOperations) {
        opSelect.innerHTML = '<option value="">Operasyon Seçin</option>' + 
            mockData.settingsOperations.map(so => `<option value="${so.id}">${so.name}</option>`).join('');
    }
    modal.style.display = 'flex';
}

window.submitAddOpToPlan = function() {
    console.log("submitAddOpToPlan çalışıyor...");
    
    const opSelect = document.getElementById('pop-op-name');
    if (!opSelect || opSelect.selectedIndex === -1 || !opSelect.value) {
        alert("Lütfen bir operasyon seçin.");
        return;
    }
    
    const opName = opSelect.options[opSelect.selectedIndex].text;
    const category = document.getElementById('pop-op-category').value;
    const target = document.getElementById('pop-op-target').value;
    const type = document.getElementById('pop-op-type').value;
    
    addOperationToPlan(opName, target, category, type === 'finish');
    closeModal('add-op-to-plan-modal');
    
    // Reset fields manually since it's not a form
    document.getElementById('pop-op-target').value = 100;
    document.getElementById('pop-op-category').value = 'Dikim';
    document.getElementById('pop-op-type').value = 'normal';
    opSelect.selectedIndex = 0;
}

window.saveStudyPlan = async function() {
    console.log("saveStudyPlan tetiklendi");
    const btn = event?.target;
    if(btn) { btn.disabled = true; btn.innerText = "Kaydediliyor..."; }
    
    const orderId = document.getElementById('plan-model-select').value;
    if (!orderId) {
        alert("Lütfen önce bir model seçin.");
        if(btn) { btn.disabled = false; btn.innerText = "Planı Kaydet"; }
        return;
    }
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if (!order) {
        alert("Model bulunamadı!");
        if(btn) { btn.disabled = false; btn.innerText = "Planı Kaydet"; }
        return;
    }

    const opRows = document.querySelectorAll('.plan-op-row');
    const operations = [];
    
    opRows.forEach(row => {
        const select = row.querySelector('.plan-op-select');
        const opId = select.value;
        const opName = select.options[select.selectedIndex].text;
        const category = row.querySelector('.plan-op-category').value;
        const target = parseInt(row.querySelector('.plan-op-target').value) || 0;
        const type = row.querySelector('.plan-op-type').value;
        
        if (opId) {
            operations.push({ id: opId, name: opName, category: category, target: target, type: type });
        }
    });
    
    if (operations.length === 0) {
        alert("Lütfen en az bir geçerli operasyon ekleyin.");
        if(btn) { btn.disabled = false; btn.innerText = "Planı Kaydet"; }
        return;
    }

    try {
        let extra = {};
        if (order.assigned_file && order.assigned_file.startsWith('{')) {
            try { extra = JSON.parse(order.assigned_file); } catch(e) {}
        }
        extra.operations = operations;

        const { error } = await supabaseClient
            .from('orders')
            .update({ assigned_file: JSON.stringify(extra) })
            .eq('id', orderId);
            
        if (error) throw error;
        
        // Optimistic update
        order.operations = operations;
        order.assigned_file = JSON.stringify(extra);
        
        alert("✅ Plan Buluta Kaydedildi!\n\nŞimdi 2. Sayfada 'Verileri Yenile' diyerek bu operasyonları kullanabilirsiniz.");
        await loadData(); 
        if (window.loadPlanMonitor) window.loadPlanMonitor();
    } catch (err) {
        console.error("Bulut Kayıt Hatası:", err);
        alert("❌ Kayıt Başarısız: " + err.message);
    } finally {
        if(btn) { btn.disabled = false; btn.innerText = "Planı Kaydet"; }
    }
}

window.addOperationToPlan = function(opName = '', target = 100, category = 'Dikim', isFinish = false) {
    console.log("Listeye operasyon ekleniyor:", {opName, target, category, isFinish});
    const list = document.getElementById('plan-operations-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'plan-op-row';
    div.style.cssText = 'display:grid; grid-template-columns: 2fr 1.2fr 1fr 1.2fr 40px; gap:8px; align-items:center; margin-bottom:10px; background:rgba(255,255,255,0.5); padding:10px; border-radius:8px; border:1px solid #ddd;';
    
    const opId = mockData.settingsOperations.find(so => so.name === opName)?.id || '';

    div.innerHTML = `
        <select class="plan-op-select" required>
            <option value="">Operasyon Seçin</option>
            ${mockData.settingsOperations.map(so => `<option value="${so.id}" ${String(so.id) === String(opId) ? 'selected' : ''}>${so.name}</option>`).join('')}
        </select>
        <select class="plan-op-category" required>
            <option value="Kesim" ${category === 'Kesim' ? 'selected' : ''}>Kesim</option>
            <option value="Dikim" ${category === 'Dikim' ? 'selected' : ''}>Dikim</option>
            <option value="Ütü Paket" ${category === 'Ütü Paket' ? 'selected' : ''}>Ütü Paket</option>
        </select>
        <input type="number" class="plan-op-target" placeholder="Hedef" value="${target}" required style="padding:5px; border-radius:4px; border:1px solid #ccc;">
        <div style="display:flex; flex-direction:column; gap:2px;">
            <label style="font-size:0.7rem; color:gray;">Tür:</label>
            <select class="plan-op-type" style="font-size:0.8rem; padding:2px;" onchange="handleFinishTypeChange(this)">
                <option value="normal" ${!isFinish ? 'selected' : ''}>Normal</option>
                <option value="finish" ${isFinish ? 'selected' : ''}>Finish (Çıkış)</option>
            </select>
        </div>
        <button type="button" class="btn-danger" style="padding:5px;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    list.appendChild(div);
}

// Data Persistence Logic (Now using Supabase)
async function saveData() {
    // Legacy function, replaced by direct async supabase calls
}

async function loadData() {
    try {
        // PERFORMANS: Sadece aktif (Tamamlanmamış) siparişleri ve son 20 logu çek
        const results = await Promise.all([
            supabaseClient.from('time_studies').select('*').order('id', { ascending: false }).limit(200),
            supabaseClient.from('orders').select('*').not('status', 'eq', 'Tamamlandı').order('id', { ascending: false }),
            supabaseClient.from('personnel').select('*').order('id', { ascending: false }),
            supabaseClient.from('firms').select('*').order('id', { ascending: false }),
            supabaseClient.from('shared_files').select('*').order('id', { ascending: false }).limit(100),
            supabaseClient.from('system_logs').select('*').order('id', { ascending: false }).limit(20),
            supabaseClient.from('settings_operations').select('*').order('id', { ascending: false }),
            supabaseClient.from('lots').select('*').order('id', { ascending: false }).limit(300),
            supabaseClient.from('app_users').select('*').order('id', { ascending: true })
        ]);

        const [studies, orders, personnel, firms, files, logs, operations, lots, users] = results.map(r => r.data || []);

        mockData.users = users.map(u => ({...u, firmId: u.firm_id}));
        mockData.studies = studies.map(s => {
            let pName = "-";
            let opName = s.operation_name;
            if (opName && opName.includes("|||")) {
                const parts = opName.split("|||");
                pName = parts[0];
                opName = parts[1];
            }
            return {
                ...s,
                firmId: s.firm_id,
                qty: s.efficiency,
                target: s.cycle_time,
                model: s.model_name,
                operation: opName,
                personnel_name: pName
            };
        });

        // Geçici temizlik: Eski formatta olanları (Grafiği bozan hatalı kayıtları) sil
        const oldStudies = studies.filter(s => !s.operation_name || !s.operation_name.includes("|||"));
        if (oldStudies.length > 0) {
            const idsToDelete = oldStudies.map(s => s.id);
            // Delete in chunks if needed, but array should be small enough for one request
            supabaseClient.from('time_studies').delete().in('id', idsToDelete).then(() => {
                console.log("Grafiği engelleyen eski format veriler kalıcı olarak temizlendi.");
            });
        }
        mockData.orders = orders.map(o => {
            let extra = {};
            try {
                if (o.assigned_file && o.assigned_file.startsWith('{')) {
                    extra = JSON.parse(o.assigned_file);
                }
            } catch(e) {}

            return {
                ...o, 
                firmId: o.firm_id, 
                start: o.start_date, 
                end: o.end_date, 
                assignedFile: o.assigned_file, 
                cuttingTarget: 0, 
                operations: extra.operations || []
            };
        });
        mockData.personnel = personnel.map(p => ({...p, firmId: p.firm_id}));
        mockData.firms = firms.map(f => ({...f, activeModels: f.active_models || [], studies: [], shipments: f.shipments}));
        mockData.settingsOperations = operations;
        mockData.lots = lots.map(l => ({...l, lotNo: l.lot_no, firmId: l.firm_id}));
        mockData.systemLogs = logs.map(l => ({...l, user: l.user_name || "Sistem", firmId: l.firm_id}));
        
        mockData.sharedFiles = files.map(f => ({
            id: f.id, time: f.time, firmId: f.firm_id, title: f.title, fileName: f.file_name, fileUrl: f.file_url, senderName: f.sender_name, is_downloaded: f.is_downloaded || false
        }));
    } catch(e) { console.error("Veri çekme hatası:", e); }
    
    // Anlık olarak selectbox listelerini güncelle
    try {
        if (typeof populateSelects === 'function') populateSelects();
        if (typeof populateModelSelects === 'function') populateModelSelects();
        if (typeof populateFirmSelects === 'function') populateFirmSelects();
    } catch (err) {
        console.warn("Dropdown populating failed:", err);
    }

    // Keşif mantığı daha güvenli yerlere taşındı.
    checkNewItems();
}

window.openLightbox = function(url, caption) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    
    img.src = url;
    cap.innerText = caption || '';
    modal.style.display = 'flex';
}

// REAL-TIME: 100+ kullanıcı için anlık veri senkronizasyonu
function initRealtime() {
    // 1. Chat Messages Realtime Channel (Isolated)
    supabaseClient
        .channel('chat-messages-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
            console.log('Canlı Veri: Yeni mesaj geldi (Realtime)...', payload);
            if (typeof handleChatChange === 'function') handleChatChange(payload);
        })
        .subscribe((status, err) => {
            console.log('Realtime Chat Status:', status);
            if (err) console.error('Realtime Chat Error:', err);
        });

    // 2. Orders Realtime Channel (Isolated)
    supabaseClient
        .channel('orders-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            console.log('Canlı Veri: Siparişler güncellendi (Realtime)...');
            loadData().then(() => { renderPlanning(); renderCuttingRecords(); renderOverviewCharts(); });
        })
        .subscribe((status, err) => {
            console.log('Realtime Orders Status:', status);
            if (err) console.warn('Realtime Orders Error/Warning:', err);
        });

    // 3. Lots Realtime Channel (Isolated)
    supabaseClient
        .channel('lots-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, () => {
            console.log('Canlı Veri: Kesim verileri güncellendi (Realtime)...');
            loadData().then(() => { renderLots(); renderCuttingRecords(); renderOverviewCharts(); });
        })
        .subscribe((status, err) => {
            console.log('Realtime Lots Status:', status);
            if (err) console.warn('Realtime Lots Error/Warning:', err);
        });

    // 4. Time Studies Realtime Channel (Isolated)
    supabaseClient
        .channel('time-studies-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'time_studies' }, () => {
            console.log('Canlı Veri: Üretim verileri güncellendi (Realtime)...');
            loadData().then(() => { renderWorkStudyRecords(); renderOverviewCharts(); });
        })
        .subscribe((status, err) => {
            console.log('Realtime Time Studies Status:', status);
            if (err) console.warn('Realtime Time Studies Error/Warning:', err);
        });

    // 5. Shared Files Realtime Channel (Isolated)
    supabaseClient
        .channel('shared-files-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_files' }, () => {
            console.log('Canlı Veri: Yeni dosya ulaştı (Realtime)...');
            loadData().then(() => { checkNewItems(); });
        })
        .subscribe((status, err) => {
            console.log('Realtime Shared Files Status:', status);
            if (err) console.warn('Realtime Shared Files Error/Warning:', err);
        });

    // 6. Firms Realtime Channel (Isolated)
    supabaseClient
        .channel('firms-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'firms' }, () => {
            console.log('Canlı Veri: Firmalar güncellendi (Realtime)...');
            loadData().then(() => { renderFirms(); });
        })
        .subscribe((status, err) => {
            console.log('Realtime Firms Status:', status);
            if (err) console.warn('Realtime Firms Error/Warning:', err);
        });
}

let lastCheckTime = localStorage.getItem('lastCheckTime') || new Date().toISOString();
let notifications = [];

function checkNewItems() {
    const isAtolye = currentUser && currentUser.firmId !== null;
    if (!isAtolye) return;

    // Dosya Bildirimleri
    const lastCheckFiles = localStorage.getItem('texLastCheckFiles') || new Date(Date.now() - 3600000).toISOString();
    const newFiles = (mockData.sharedFiles || []).filter(f => f.time > lastCheckFiles);
    if (newFiles.length > 0) {
        newFiles.forEach(f => {
            addNotification(`Yeni Dosya: ${f.title}`, `İndirilebilir yeni dosyanız var.`);
        });
        localStorage.setItem('texLastCheckFiles', new Date().toISOString());
    }

    // Yeni Sipariş Bildirimleri
    const lastCheckOrders = localStorage.getItem('texLastCheckOrders') || new Date(Date.now() - 3600000).toISOString();
    const myOrders = (mockData.orders || []).filter(o => String(o.firmId) === String(currentUser.firmId));
    // updated_at veya created_at kullan
    const newOrders = myOrders.filter(o => (o.updated_at || o.created_at) > lastCheckOrders);
    if (newOrders.length > 0) {
        newOrders.forEach(o => {
            addNotification(`Yeni Sipariş: ${o.model}`, `Listenize yeni bir model eklendi.`);
        });
        localStorage.setItem('texLastCheckOrders', new Date().toISOString());
    }
    
    updateNotifyUI();
}

function addNotification(text, time) {
    if (notifications.some(n => n.text === text)) return;
    notifications.unshift({ text, time: time || new Date().toLocaleString('tr-TR') });
    if (notifications.length > 10) notifications.pop();
}

let chatPollInterval = null;

window.toggleNotificationPanel = function() {
    const panel = document.getElementById('notification-panel');
    const isOpening = panel && window.getComputedStyle(panel).display === 'none';
    panel.style.display = isOpening ? 'flex' : 'none';
    
    if (isOpening) {
        localStorage.setItem('lastCheckTime', new Date().toISOString());
        document.getElementById('notify-count').style.display = 'none';
        document.getElementById('notify-count').innerText = "0";
        loadChatMessages();
        
        // 5 saniyede bir otomatik yenileme (Realtime yedeği)
        if (chatPollInterval) clearInterval(chatPollInterval);
        chatPollInterval = setInterval(() => {
            loadChatMessages();
        }, 5000);
    } else {
        if (chatPollInterval) {
            clearInterval(chatPollInterval);
            chatPollInterval = null;
        }
    }
}

function updateNotifyUI() {
    const countBadge = document.getElementById('notify-count');
    const list = document.getElementById('notify-list');
    if (!list) return;
    
    if (notifications.length > 0) {
        if (countBadge) {
            countBadge.innerText = notifications.length;
            countBadge.style.display = 'block';
        }
        
        let html = '';
        notifications.forEach(n => {
            html += `<div class="notify-item"><small>${n.time}</small>${n.text}</div>`;
        });
        list.innerHTML = html;
    }
}

window.clearNotifications = function() {
    notifications = [];
    const list = document.getElementById('notify-list');
    if (list) {
        list.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">Yeni bildirim yok.</p>';
    }
    const countBadge = document.getElementById('notify-count');
    if (countBadge) countBadge.style.display = 'none';
}

async function uploadFileToSupabase(file) {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) {
        alert("Dosya boyutu 10MB'dan büyük olamaz!");
        return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    const { data, error } = await supabaseClient.storage
        .from('tekstil-files')
        .upload(filePath, file);
        
    if (error) {
        console.error("Yükleme hatası:", error);
        alert("Dosya yüklenirken bir hata oluştu: " + error.message);
        return null;
    }
    
    const { data: { publicUrl } } = supabaseClient.storage
        .from('tekstil-files')
        .getPublicUrl(filePath);
        
    return { name: file.name, url: publicUrl, type: file.type };
}

// Auth Logic
let currentUser = null;

async function addSystemLog(actionText, firmIdOverride = undefined) {
    if(!mockData.systemLogs) mockData.systemLogs = [];
    const uName = currentUser ? currentUser.username : "Sistem";
    const fId = firmIdOverride !== undefined ? firmIdOverride : (currentUser ? currentUser.firmId : null);
    
    try {
        await supabaseClient.from('system_logs').insert({
            time: new Date().toLocaleString('tr-TR'),
            user_name: uName,
            firm_id: fId,
            action: actionText
        });
        
        // Veritabanında son 20 log dışındakileri silerek temizle
        const { data: recentLogs } = await supabaseClient
            .from('system_logs')
            .select('id')
            .order('id', { ascending: false })
            .limit(20);
            
        if (recentLogs && recentLogs.length >= 20) {
            const minIdToKeep = recentLogs[recentLogs.length - 1].id;
            await supabaseClient
                .from('system_logs')
                .delete()
                .lt('id', minIdToKeep);
        }
    } catch (e) {
        console.error("Log kaydetme veya temizleme hatası:", e);
    }
    
    // Yerel listede son 20 logu tut ve güncelle
    mockData.systemLogs.unshift({
        time: new Date().toLocaleString('tr-TR'),
        user: uName,
        firmId: fId,
        action: actionText
    });
    mockData.systemLogs = mockData.systemLogs.slice(0, 20);
    
    if(typeof renderLogs === 'function') renderLogs();
}

const rolePermissions = {
    "İmalat Admini": ["overview", "loading", "planning", "barcode", "manufacturing", "system-logs", "settings"],
    "malat Admini": ["overview", "loading", "planning", "barcode", "manufacturing", "system-logs", "settings"],
    "Atölye Admini": ["overview", "personnel", "work-study", "loading", "planning", "barcode", "settings"],
    "Atlye Admini": ["overview", "personnel", "work-study", "loading", "planning", "barcode", "settings"],
    "Admin": ["overview", "personnel", "work-study", "loading", "planning", "barcode", "manufacturing", "settings"],
    "Patron": ["overview", "personnel", "work-study", "loading", "planning", "barcode"],
    "Müdür": ["overview", "personnel", "work-study", "loading", "planning", "barcode"],
    "Etütçü": ["overview", "work-study"],
    "Etüt Sorumlusu": ["overview", "work-study"],
    "Planlamacı": ["overview", "planning"],
    "Kesimci": ["overview", "planning"],
    "Sevkiyat": ["overview", "barcode", "loading"],
    "Sistem Yöneticisi": ["overview", "personnel", "work-study", "loading", "planning", "barcode", "manufacturing", "settings"]
};

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const remember = document.getElementById('login-remember').checked;
    
    const foundUser = mockData.users.find(u => {
        const dbU = u.username.toLowerCase();
        const inputU = user.toLowerCase();
        return (dbU === inputU || dbU.endsWith("_" + inputU)) && u.password === pass;
    });
    
    if(foundUser) {
        currentUser = { ...foundUser, permissions: rolePermissions[foundUser.role] || [] };
        
        try {
            if (remember) {
                localStorage.setItem('texTrackUser', user);
                localStorage.setItem('texTrackPass', pass);
            } else {
                localStorage.removeItem('texTrackUser');
                localStorage.removeItem('texTrackPass');
            }
        } catch (e) {
            console.warn("Local storage kullanılamıyor.");
        }
        
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        
        document.getElementById('header-username').innerText = currentUser.username;
        document.getElementById('header-role').innerText = currentUser.role;
        
        applyPermissions();
        addSystemLog("Sisteme giriş yaptı.");
        
        // Giriş yapıldığında mesajları yükle ve hazırla
        loadChatMessages().catch(err => console.warn("Initial login chat load failed", err));
    } else {
        alert("Hatalı kullanıcı adı veya şifre!");
    }
});

window.logout = function() {
    if (currentUser) {
        addSystemLog("Sistemden çıkış yaptı.");
    }
    currentUser = null;
    try {
        localStorage.removeItem('texTrackUser');
        localStorage.removeItem('texTrackPass');
    } catch (e) {}
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-form').reset();
    const chatBtn = document.getElementById('notification-bell');
    if (chatBtn) chatBtn.style.display = 'none';
    const chatPanel = document.getElementById('notification-panel');
    if (chatPanel) chatPanel.style.display = 'none';
    const refreshBtn = document.getElementById('global-refresh-btn');
    if (refreshBtn) refreshBtn.style.display = 'none';
    if (chatPollInterval) {
        clearInterval(chatPollInterval);
        chatPollInterval = null;
    }
}

function applyPermissions() {
    const allowed = currentUser.permissions || [];
    
    let firstAllowed = null;
    document.querySelectorAll('.nav-item').forEach(btn => {
        const target = btn.getAttribute('data-target');
        if(allowed.includes(target)) {
            btn.style.display = 'flex';
            if(!firstAllowed) firstAllowed = btn;
        } else {
            btn.style.display = 'none';
        }
    });

    // Garanti: Dosya Yönetimi butonu tamamen gizli
    const fsBtn = document.getElementById('nav-file-share');
    if(fsBtn) {
        fsBtn.style.display = 'none';
    }
    
    if(firstAllowed) {
        firstAllowed.click();
    }
    
    // Divergent UI for HQ vs Workshop
    const isAtolye = currentUser && currentUser.firmId !== null;
    
    const btnAddModel = document.getElementById('btn-add-model');
    if(btnAddModel) btnAddModel.style.display = isAtolye ? 'none' : 'inline-block';
    
    const hqUpload = document.getElementById('file-upload-hq');
    if(hqUpload) hqUpload.style.display = isAtolye ? 'none' : 'block';
    
    const tabFileShare = document.getElementById('tab-file-share');
    if(tabFileShare) tabFileShare.innerText = isAtolye ? 'Gelen Dosyalar' : 'Dosya Gönder';

    // Chat butonu görünürlüğü: Sadece Atölye Admini, İmalat Admini, Admin, Sistem Yöneticisi
    const chatBtn = document.getElementById('notification-bell');
    if (chatBtn) {
        if (currentUser) {
            const role = (currentUser.role || '').toLowerCase();
            const isAdmin = role.includes('atlye') || role.includes('atölye') || role.includes('imalat') || role.includes('malat') || role === 'admin' || role === 'sistem yöneticisi';
            chatBtn.style.display = isAdmin ? 'flex' : 'none';
        } else {
            chatBtn.style.display = 'none';
        }
    }

    // Floating Refresh butonu görünürlüğü: Giriş yapan tüm kullanıcılara açık
    const refreshBtn = document.getElementById('global-refresh-btn');
    if (refreshBtn) {
        refreshBtn.style.display = currentUser ? 'flex' : 'none';
    }

    // Raporlar butonu görünürlüğü: Atölye kullanıcısında tamamen kaldırıldı
    const reportsBtn = document.getElementById('btn-global-reports');
    if (reportsBtn) {
        reportsBtn.style.display = isAtolye ? 'none' : 'inline-block';
    }

    // Atölye Sayısı Kartı ve Departman Verimliliği Kartı Kontrolleri
    const firmsCountCard = document.getElementById('stat-card-firms-count');
    const firmsCountEl = document.getElementById('stat-firms-count');
    if (firmsCountCard) {
        firmsCountCard.style.display = isAtolye ? 'none' : 'flex';
        if (!isAtolye && firmsCountEl && mockData.firms) {
            firmsCountEl.innerText = mockData.firms.length;
        }
    }

    const deptCard = document.getElementById('card-dept-efficiency');
    const chartsContainer = document.querySelector('.charts-container');
    if (deptCard) {
        deptCard.style.display = isAtolye ? 'none' : 'block';
    }
    if (chartsContainer) {
        chartsContainer.style.gridTemplateColumns = isAtolye ? '1fr' : '2fr 1fr';
    }
}

// Current Date removed as it was replaced by User Profile

// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('page-title');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));
        
        // Add active class to clicked
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        
        // Update Title
        pageTitle.innerText = item.innerText.trim();
        
        if (targetId === 'file-share-main') {
            renderSharedFilesMain();
            const firstSubTab = document.getElementById('tab-files-list');
            if(firstSubTab) firstSubTab.click();
        }
        if (targetId === 'manufacturing') renderFirms();
        if (targetId === 'barcode') renderLots();
        if (targetId === 'planning') renderPlanning();
        if (targetId === 'completed-orders') renderCompletedOrders();
        if (targetId === 'overview') renderOverviewCharts();
        if (targetId === 'system-logs') renderLogs();
        if (targetId === 'personnel') renderPersonnel();
        if (targetId === 'settings') {
            renderUsers();
            renderSettingsOperations();
        }
        if (targetId === 'work-study') {
            populateModelSelects();
            renderWorkStudyRecords();
        }
    });
});

// Sub-tabs Logic
const subTabs = document.querySelectorAll('.sub-tab');
subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const parentSection = tab.closest('.page-section') || tab.closest('.modal-content');
        const targetId = tab.getAttribute('data-subtarget');
        
        parentSection.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        parentSection.querySelectorAll('.sub-section, .edit-sub-section').forEach(s => s.style.display = 'none');
        
        tab.classList.add('active');
        document.getElementById(targetId).style.display = 'block';
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try { initRealtime(); } catch(e) { console.warn("Realtime init failed", e); }
    try { await loadData(); } catch(e) { console.error("Initial load failed", e); }
    try { await loadChatMessages(); } catch(e) {}

    // --- GEÇİCİ TEŞHİS: Sütun isimlerini kontrol et ---
    supabaseClient.from('time_studies').select('*').limit(1).then(res => {
        if (res.data && res.data.length > 0) {
            const keys = Object.keys(res.data[0]).join(", ");
            // alert("SİSTEM TEŞHİS - time_studies sütunları: " + keys); // Kullanıcıyı rahatsız etmemesi için alert kapatıldı
            console.log("DEBUG - Studies Table Keys:", keys);
        } else {
            console.warn("time_studies tablosu boş, sütunlar teşhis edilemedi.");
        }
    });
    
    // UI Renders
    const safeRender = (fn, name) => {
        try { if(typeof fn === 'function') fn(); } catch(e) { console.warn(`${name} failed`, e); }
    };

    safeRender(renderOverviewCharts, 'Overview');
    safeRender(renderPersonnel, 'Personnel');
    safeRender(renderWorkStudyRecords, 'WorkStudy');
    safeRender(renderPlanning, 'Planning');
    safeRender(renderLots, 'Lots');
    safeRender(populateSelects, 'Selects');
    safeRender(populateModelSelects, 'ModelSelects');
    safeRender(populateFirmSelects, 'FirmSelects');
    safeRender(renderSettingsOperations, 'SettingsOps');
    safeRender(renderUsers, 'Users');
    safeRender(renderFirms, 'Firms');
    safeRender(renderLogs, 'Logs');
    safeRender(renderSharedFilesMain, "Files");
    
    // Varsayılan tarih olarak bugünü ata
    const studyDateInput = document.getElementById('study-date');
    if (studyDateInput) {
        studyDateInput.value = new Date().toISOString().split('T')[0];
    }
    const overviewDatePicker = document.getElementById('overview-date-picker');
    if (overviewDatePicker) {
        overviewDatePicker.value = new Date().toISOString().split('T')[0];
    }
    
    // Auto-login check
    try {
        const savedUser = localStorage.getItem('texTrackUser');
        const savedPass = localStorage.getItem('texTrackPass');
        if (savedUser && savedPass) {
            document.getElementById('login-user').value = savedUser;
            document.getElementById('login-pass').value = savedPass;
            document.getElementById('login-remember').checked = true;
            
            const evt = new Event('submit', { cancelable: true });
            document.getElementById('login-form').dispatchEvent(evt);
        }
    } catch(e) {
        console.warn("Local storage check failed.");
    }

    // --- Form Listeners ---
    // (study-form submit listener removed in favor of window.saveWorkStudyData for stability)

    const personnelForm = document.getElementById('add-personnel-form');
    if (personnelForm) {
        personnelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-p-name').value;
            const dept = document.getElementById('new-p-dept').value;
            const shift = document.getElementById('new-p-shift').value;
            const firmId = currentUser ? currentUser.firmId : null;
            try {
                const { error } = await supabaseClient.from('personnel').insert({ name, dept, shift, firm_id: firmId });
                if (error) throw error;
                await loadData();
                renderPersonnel();
                closeModal('add-personnel-modal');
                e.target.reset();
            } catch (err) { alert("Hata: " + err.message); }
        });
    }


});


// --- Core Dashboards ---
window.refreshAllData = async function() {
    // Tüm yenile butonlarını ve ikonlarını bul
    const refreshElements = document.querySelectorAll('[onclick="refreshAllData()"]');
    refreshElements.forEach(el => {
        if (el.tagName === 'BUTTON') el.disabled = true;
        const icon = el.querySelector('i');
        if (icon) icon.classList.add('fa-spin');
    });
    
    try {
        await loadData();
        renderOverviewCharts();
        renderWorkStudyRecords();
        if (window.renderPlanning) renderPlanning();
        if (window.renderPersonnel) renderPersonnel();
        if (window.renderLogs) renderLogs();
        if (window.renderFirms) renderFirms();
        if (window.renderUsers) renderUsers();
        
        alert("✅ Tüm veriler başarıyla güncellendi.");
    } catch (e) {
        alert("Hata: " + e.message);
    } finally {
        refreshElements.forEach(el => {
            if (el.tagName === 'BUTTON') el.disabled = false;
            const icon = el.querySelector('i');
            if (icon) icon.classList.remove('fa-spin');
        });
    }
}

  let overviewTab = 'daily';
window.switchOverviewTab = function(tab) {
    overviewTab = tab;
    
    const btnDaily = document.getElementById('btn-overview-daily');
    const btnCumulative = document.getElementById('btn-overview-cumulative');
    const datePickerContainer = document.getElementById('overview-date-picker-container');
    const prodTitleEl = document.getElementById('stat-daily-prod-title');
    
    if (tab === 'daily') {
        if (btnDaily) btnDaily.classList.add('active');
        if (btnCumulative) btnCumulative.classList.remove('active');
        if (datePickerContainer) datePickerContainer.style.display = 'flex';
        if (prodTitleEl) prodTitleEl.innerText = 'Günlük Üretim';
    } else {
        if (btnDaily) btnDaily.classList.remove('active');
        if (btnCumulative) btnCumulative.classList.add('active');
        if (datePickerContainer) datePickerContainer.style.display = 'none';
        if (prodTitleEl) prodTitleEl.innerText = 'Kümülatif Üretim';
    }
    
    renderOverviewCharts();
};

function renderOverviewCharts() {
    // Update Dashboard Stats
    const activePersonnelEl = document.getElementById('stat-active-personnel');
    const avgEfficiencyEl = document.getElementById('stat-avg-efficiency');
    const dailyProdEl = document.getElementById('stat-daily-prod');

    const overviewDatePicker = document.getElementById('overview-date-picker');
    if (overviewDatePicker && !overviewDatePicker.value) {
        overviewDatePicker.value = new Date().toISOString().split('T')[0];
    }
    const selectedDateStr = overviewDatePicker ? overviewDatePicker.value : new Date().toISOString().split('T')[0];
    const selectedDate = new Date(selectedDateStr);
    const selectedDateDayStr = selectedDate.toDateString();

    if (activePersonnelEl) {
        const personnelCount = getFiltered(mockData.personnel || []).length;
        activePersonnelEl.innerText = personnelCount;
    }

    const firmsCountEl = document.getElementById('stat-firms-count');
    if (firmsCountEl) {
        firmsCountEl.innerText = (mockData.firms || []).length;
    }

    if (avgEfficiencyEl) {
        let studies = getFiltered(mockData.studies || []);
        if (overviewTab === 'daily') {
            studies = studies.filter(s => {
                const dt = s.time ? new Date(s.time) : new Date(s.created_at || Date.now());
                return dt.toDateString() === selectedDateDayStr;
            });
        }
        
        if (studies.length > 0) {
            let totalEfficiencyPct = 0;
            let validCount = 0;
            studies.forEach(s => {
                const target = s.cycle_time || 0;
                const actual = s.efficiency || 0;
                if (target > 0) {
                    totalEfficiencyPct += Math.round((actual / target) * 100);
                    validCount++;
                }
            });
            const avgPct = validCount > 0 ? Math.round(totalEfficiencyPct / validCount) : 0;
            avgEfficiencyEl.innerText = "%" + avgPct;
        } else {
            avgEfficiencyEl.innerText = "%0";
        }
    }

    if (dailyProdEl) {
        // Find all finish operation names across all orders
        const finishOpNames = new Set();
        (mockData.orders || []).forEach(order => {
            const ops = order.operations || [];
            let finishOp = ops.find(op => op.category === 'Sevkiyat' && op.type === 'finish');
            if (!finishOp) {
                finishOp = ops.find(op => op.category === 'Ütü Paket' && op.type === 'finish');
            }
            if (finishOp) finishOpNames.add(finishOp.name);
        });

        let filteredStudies = getFiltered(mockData.studies || []);
        if (overviewTab === 'daily') {
            filteredStudies = filteredStudies.filter(s => {
                const dt = s.time ? new Date(s.time) : new Date(s.created_at || Date.now());
                return dt.toDateString() === selectedDateDayStr && finishOpNames.has(s.operation);
            });
        } else {
            filteredStudies = filteredStudies.filter(s => finishOpNames.has(s.operation));
        }

        const dailyProd = filteredStudies.reduce((sum, s) => sum + (s.efficiency || 0), 0);
        dailyProdEl.innerHTML = `${dailyProd} <small>Adet</small>`;
    }

    const containers = [
        document.getElementById('model-charts-container'),
        document.getElementById('study-entry-charts')
    ].filter(c => c !== null);
    
    if (containers.length === 0) return;

    const activeOrders = getFiltered(mockData.orders).filter(o => o.status !== 'Tamamlandı');
    
    containers.forEach(container => {
        if (activeOrders.length === 0) {
            container.innerHTML = `
                <div class="chart-card glass" style="grid-column: 1/-1; text-align:center; padding:50px; color:gray;">
                    <h3>Aktif Model Üretim Analizi</h3>
                    <p>Henüz aktif bir üretim planı bulunmamaktadır.</p>
                </div>`;
            return;
        }

        container.innerHTML = '';
        activeOrders.forEach(order => {
            const ops = order.operations || [];
            
            // Helper to get total for a category's finish operation
            const getCategoryOutput = (catName) => {
                const finishOp = ops.find(op => op.category === catName && op.type === 'finish');
                if (!finishOp) {
                    if (catName === 'Kesim') {
                        return mockData.lots.filter(l => {
                            if (String(l.order_id) !== String(order.id)) return false;
                            if (overviewTab === 'daily') {
                                const lDate = new Date(l.created_at);
                                return lDate.toDateString() === selectedDateDayStr;
                            }
                            return true;
                        }).reduce((acc, l) => acc + (l.qty || 0), 0);
                    }
                    if (catName === 'Ütü Paket') {
                        return mockData.lots.filter(l => {
                            if (String(l.order_id) !== String(order.id) || l.status !== 'Paketlendi') return false;
                            if (overviewTab === 'daily') {
                                const lDate = new Date(l.updated_at || l.created_at);
                                return lDate.toDateString() === selectedDateDayStr;
                            }
                            return true;
                        }).reduce((acc, l) => acc + (l.qty || 0), 0);
                    }
                    return 0;
                }
                const studies = mockData.studies.filter(s => {
                    if (s.model !== `${order.customer} - ${order.model}` || s.operation !== finishOp.name) return false;
                    if (overviewTab === 'daily') {
                        const sDate = s.time ? new Date(s.time) : new Date(s.created_at || Date.now());
                        return sDate.toDateString() === selectedDateDayStr;
                    }
                    return true;
                });
                return studies.reduce((acc, s) => acc + (s.qty || 0), 0);
            };

            const totalCut = getCategoryOutput('Kesim');
            const totalSewn = getCategoryOutput('Dikim');
            const totalPacked = getCategoryOutput('Ütü Paket');

            const chartId = `chart-${container.id || 'study'}-${order.id}`;
            const card = document.createElement('div');
            card.className = 'chart-card glass';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0; font-size:1rem;">${order.customer} - ${order.model}</h3>
                    <span class="badge badge-info" style="font-size:0.7rem;">Sipariş: ${order.qty}</span>
                </div>
                <div class="canvas-container" style="height:180px;">
                    <canvas id="${chartId}"></canvas>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px; text-align:center; font-size:0.7rem;">
                    <div><i class="fa-solid fa-scissors"></i> Kesim: <strong>${totalCut}</strong></div>
                    <div><i class="fa-solid fa-shirt"></i> Dikim: <strong>${totalSewn}</strong></div>
                    <div><i class="fa-solid fa-box-open"></i> Paket: <strong>${totalPacked}</strong></div>
                </div>
            `;
            container.appendChild(card);

            // Render Chart
            setTimeout(() => {
                const ctxEl = document.getElementById(chartId);
                if (!ctxEl) return;
                const ctx = ctxEl.getContext('2d');
                
                const datasets = [];
                const scales = {
                    y: { stacked: overviewTab === 'cumulative', grid: { display: false } }
                };
                
                if (overviewTab === 'daily') {
                    datasets.push({
                        label: 'Günlük Üretim',
                        data: [totalCut, totalSewn, totalPacked],
                        backgroundColor: ['#3498db', '#10b981', '#f59e0b'],
                        borderRadius: 5
                    });
                    scales.x = { beginAtZero: true };
                } else {
                    datasets.push({
                        label: 'Tamamlanan',
                        data: [totalCut, totalSewn, totalPacked],
                        backgroundColor: ['#3498db', '#10b981', '#f59e0b'],
                        borderRadius: 5
                    }, {
                        label: 'Kalan',
                        data: [
                            Math.max(0, order.qty - totalCut), 
                            Math.max(0, order.qty - totalSewn), 
                            Math.max(0, order.qty - totalPacked)
                        ],
                        backgroundColor: '#eeeeee',
                        borderRadius: 5
                    });
                    scales.x = { stacked: true, max: order.qty, display: false };
                }
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Kesim', 'Dikim', 'Paket'],
                        datasets: datasets
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: scales
                    }
                });
            }, 50);
    });
});
}

function getFiltered(array) {
    if (!currentUser) return [];
    // Merkez rolleri her şeyi görür
    const role = currentUser.role || '';
    if (currentUser.firmId == null || role === 'İmalat Admini' || role === 'malat Admini' || role === 'Admin' || role === 'Patron') {
        return array;
    }
    
    // Atölyeler sadece kendi firmId'sine sahip verileri görmeli
    const cId = String(currentUser.firmId);
    return array.filter(item => {
        const itemFirmId = item.firmId || item.firm_id;
        if (itemFirmId && String(itemFirmId) === cId) return true;
        
        // Ekstra Güvenlik: İsim bazlı kontrol (Personel için)
        if (item.name && item.name.includes("_personel_")) {
            const firm = mockData.firms.find(f => f.id === currentUser.firmId);
            if (firm && item.name.startsWith(firm.name + "_personel_")) return true;
        }
        return false;
    });
}

function renderDeptEfficiency() {
    const depts = [
        { name: 'Kesim', value: 92, color: '#10b981' },
        { name: 'Dikim', value: 78, color: '#f59e0b' },
        { name: 'Ütü/Paket', value: 88, color: '#10b981' },
        { name: 'Kalite', value: 65, color: '#ef4444' }
    ];
    
    const container = document.getElementById('dept-efficiency');
    let html = '';
    depts.forEach(d => {
        html += `
        <div class="mb-2" style="margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="font-weight:500;">${d.name}</span>
                <span style="font-weight:600; color:${d.color}">${d.value}%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${d.value}%; background-color: ${d.color}"></div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}

function renderPersonnel() {
    const container = document.getElementById('personnel-list');
    let html = '';
    getFiltered(mockData.personnel).forEach(p => {
        // Calculate dynamic actual and target from studies
        const pStudies = getFiltered(mockData.studies).filter(s => s.name === p.name);
        let totalTarget = 0;
        let totalActual = 0;
        pStudies.forEach(s => {
            totalTarget += s.target || 0;
            totalActual += s.amount || 0;
        });
        
        const eff = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
        let badgeClass = 'badge-success';
        if (eff === 0) badgeClass = 'badge-primary';
        else if (eff < 80) badgeClass = 'badge-danger';
        else if (eff < 95) badgeClass = 'badge-warning';

        const firm = mockData.firms.find(f => f.id === p.firm_id);
        const firmName = firm ? firm.name : "Sistem (Merkez)";

        let displayName = p.name || "";
        if (displayName.includes("_personel_")) {
            displayName = displayName.split("_personel_")[1];
        }

        html += `
        <div class="personnel-card glass">
            <div class="p-card-header">
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="p-avatar"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <h3 style="font-size:1.1rem; color:#2c3e50;">${displayName}</h3>
                        <p style="font-size:0.85rem;">${p.dept} | ${p.shift}</p>
                        <p style="font-size:0.75rem; color:var(--secondary);"><i class="fa-solid fa-building"></i> ${firmName}</p>
                    </div>
                </div>
                <div style="display:flex; gap: 5px; align-items: center;">
                    <span class="badge ${badgeClass}">%${eff}</span>
                    <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deletePersonnel(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div style="margin-top:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.9rem;">
                    <span>Etüt Toplamı (Gerçek / Hedef)</span>
                    <strong>${totalActual} / ${totalTarget}</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${eff > 100 ? 100 : eff}%"></div>
                </div>
            </div>
            <button class="btn-primary w-100 mt-2" style="justify-content:center;" onclick="openPersonnelDetails(${p.id})">Detaylı Analiz</button>
        </div>
        `;
    });
    container.innerHTML = html;
}

function populateSelects() {
    const select = document.getElementById('study-personnel');
    if(!select) return;
    select.innerHTML = '<option value="">Personel Seçin</option>';
    getFiltered(mockData.personnel).forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        let displayName = p.name || "";
        if (displayName.includes("_personel_")) {
            displayName = displayName.split("_personel_")[1];
        }
        option.innerText = displayName + ' (' + p.dept + ')';
        select.appendChild(option);
    });
}

function populateModelSelects() {
    const studySelect = document.getElementById('study-model');
    const planSelect = document.getElementById('plan-model-select');
    const monitorSelect = document.getElementById('monitor-model-select');
    
    // Hiyerarşi Düzenlemesi: Sadece atanmış modelleri göster (İmalat -> Atölye akışı)
    let filteredOrders = getFiltered(mockData.orders || []);

    // Atölye kullanıcıları için "Planlandı" durumundaki modelleri gizleme filtresi kaldırıldı.
    // Atölye planlanan modelleri anında görebilecek ve işlem yapabilecektir.

    const options = '<option value="">Model Seçin</option>' + 
        filteredOrders.map(o => `<option value="${o.id}">${o.customer} - ${o.model}</option>`).join('');
    
    if (studySelect) studySelect.innerHTML = options;
    if (planSelect) planSelect.innerHTML = options;
    if (monitorSelect) monitorSelect.innerHTML = options;
    console.log("Model listeleri yetkiye göre güncellendi. Toplam:", filteredOrders.length);
}

window.loadPlanMonitor = function() {
    const orderId = document.getElementById('monitor-model-select').value;
    const list = document.getElementById('monitor-plan-list');
    if (!list) return;
    
    if (!orderId) {
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:gray;">Lütfen yukarıdan bir model seçin.</td></tr>';
        return;
    }
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if (order && order.operations && order.operations.length > 0) {
        list.innerHTML = order.operations.map((op, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${op.name}</strong></td>
                <td>${op.category}</td>
                <td>${op.target} <small>Adet/Saat</small></td>
                <td>
                    ${op.type === 'finish' ? '<span class="badge badge-success">FİNİSH (Çıkış)</span>' : '<span class="badge badge-info">Normal</span>'}
                </td>
            </tr>
        `).join('');
    } else {
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:gray;">Bu model için henüz bir etüt planı tanımlanmamış.</td></tr>';
    }
}

function populateFirmSelects() {
    const modelFirm = document.getElementById('new-m-firm');
    const shareFirm = document.getElementById('share-file-firm-main');
    const assignFirmSelect = document.getElementById('assign-firm-select');
    const userFirmSelect = document.getElementById('new-u-firm');
    
    if (modelFirm) modelFirm.innerHTML = '<option value="">-- Henüz Atanmadı (Merkez Planlama) --</option>';
    if (shareFirm) shareFirm.innerHTML = '<option value="">Tüm Atölyeler</option>';
    if (assignFirmSelect) assignFirmSelect.innerHTML = '<option value="">Atölye Seçiniz...</option>';
    if (userFirmSelect) userFirmSelect.innerHTML = '<option value="">-- Merkez (Firma Yok) --</option>';
    
    mockData.firms.forEach(f => {
        const option = `<option value="${f.id}">${f.name}</option>`;
        if(modelFirm) modelFirm.insertAdjacentHTML('beforeend', option);
        if(shareFirm) shareFirm.insertAdjacentHTML('beforeend', option);
        if(assignFirmSelect) assignFirmSelect.insertAdjacentHTML('beforeend', option);
        if(userFirmSelect) userFirmSelect.insertAdjacentHTML('beforeend', option);
    });
}

// (Old listeners removed to prevent conflicts with new Work-Study plan logic)

// Loading Estimation Logic
function calculateLoading() {
    const qty = document.getElementById('order-qty').value;
    const cap = document.getElementById('daily-cap').value;
    const over = document.getElementById('overtime').value;
    
    if(!qty || !cap) return alert('Lütfen alanları doldurun.');
    
    const dailyTotal = parseFloat(cap) * (1 + (parseFloat(over)/100));
    const days = Math.ceil(qty / dailyTotal);
    
    document.getElementById('est-days').innerText = days;
    const progress = document.getElementById('est-progress');
    progress.style.width = '0%';
    setTimeout(() => { progress.style.width = '100%'; }, 200);
}

// Planning & Orders
function renderPlanning() {
    const container = document.getElementById('planning-records-container');
    if (!container) return;
    let html = '';
    
    const isAtolye = currentUser && currentUser.firmId !== null;
    
    // Helper to get stage progress for traceability
    const getStageProgress = (order, catName) => {
        // assigned_file içindeki operasyonlara bak
        let ops = [];
        try {
            if (order.assigned_file && order.assigned_file.startsWith('{')) {
                const extra = JSON.parse(order.assigned_file);
                ops = extra.operations || [];
            }
        } catch(e) {}
        
        const finishOp = ops.find(op => op.category === catName && op.type === 'finish');
        let actual = 0;
        if (finishOp) {
            actual = mockData.studies.filter(s => String(s.order_id) === String(order.id) && String(s.operation_id) === String(finishOp.id)).reduce((acc, s) => acc + (s.actual_qty || 0), 0);
        } else if (catName === 'Kesim') {
            actual = mockData.lots.filter(l => String(l.order_id) === String(order.id)).reduce((acc, l) => acc + (l.qty || 0), 0);
        }
        return Math.min(100, Math.round((actual / (order.qty || 1)) * 100));
    };

    getFiltered(mockData.orders).forEach(o => {
        const firm = mockData.firms.find(f => f.id == o.firmId);
        const firmName = firm ? firm.name : 'Merkez Planlama';
        
        // Find background image if exists in JSON
        let bgImg = '';
        try {
            if (o.assigned_file && o.assigned_file.startsWith('{')) {
                const extra = JSON.parse(o.assigned_file);
                if (extra.drawings) {
                    const imgFile = extra.drawings.find(f => f.category === 'Image');
                    if (imgFile) bgImg = imgFile.url;
                    // Image yoksa SampleDrawing dene
                    if (!bgImg) {
                        const sample = extra.drawings.find(f => f.category === 'SampleDrawing');
                        if (sample) bgImg = sample.url;
                    }
                }
            } else if (o.assigned_file) {
                bgImg = o.assigned_file;
            }
        } catch(e) {}

        let statusBadge = '';
        let actionBtn = '';
        
        if (o.status === 'Planlandı') {
            statusBadge = '<span class="badge badge-success">Planlandı</span>';
            actionBtn = `<span style="font-size:0.8rem; color:gray;">Atölye Bekleniyor...</span>`;
        } else {
            statusBadge = `<span class="badge badge-info">${o.status}</span>`;
            actionBtn = `<span style="font-size:0.8rem; color:gray;">Süreç Devam Ediyor...</span>`;
        }

        html += `
        <div class="model-card glass" style="position:relative; overflow:hidden; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; padding:15px; border-radius:12px; transition: transform 0.2s;">
            <!-- Background Image with 60% Opacity -->
            ${bgImg ? `<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:url('${bgImg}') center/cover no-repeat; opacity:0.6; z-index:0;"></div>` : `<div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); opacity:0.3; z-index:0;"></div>`}
            
            <!-- Content Layer -->
            <div style="position:relative; z-index:1;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem; color:var(--secondary); text-shadow: 0 1px 2px rgba(255,255,255,0.8);">${o.model}</h3>
                        <small style="color:#555; font-weight:600;">${o.customer}</small>
                    </div>
                    ${statusBadge}
                </div>
                <div style="margin-top:15px; font-size:0.9rem; background:rgba(255,255,255,0.7); padding:8px; border-radius:8px; border:1px solid rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between;"><span>Adet:</span> <strong>${o.qty}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Atölye:</span> <strong>${firmName}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Teslim:</span> <strong>${o.end}</strong></div>
                </div>
                
                <!-- Stage Progress Bars -->
                <div style="margin-top:10px; font-size:0.75rem;">
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span>Dikim</span>
                            <span>%${getStageProgress(o, 'Dikim')}</span>
                        </div>
                        <div class="progress-track" style="height:4px;"><div class="progress-fill" style="width:${getStageProgress(o, 'Dikim')}%; background:#10b981;"></div></div>
                    </div>
                </div>
            </div>

            <div style="position:relative; z-index:100; display:flex; gap:5px; margin-top:15px;">
                ${firm ? actionBtn : `<button class="btn-primary" style="width:100%; background: #3498db; border:none; cursor:pointer;" data-action="open-assign" data-id="${o.id}"><i class="fa-solid fa-industry"></i> Atölye Ata</button>`}
                <button class="btn-primary" style="width:60px; height:50px; background: var(--secondary); padding:5px; cursor:pointer; position:relative; z-index:101; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:10px; line-height:1.2;" title="Detay" data-action="open-detail" data-id="${o.id}">
                    <i class="fa-solid fa-eye" style="font-size:18px; margin-bottom:2px;"></i>
                    <span style="font-weight:600;">Detay</span>
                </button>
                ${!isAtolye ? `
                <button class="btn-primary" style="width:60px; height:50px; background: #e74c3c; border:none; padding:5px; cursor:pointer; position:relative; z-index:101; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:10px; line-height:1.2;" title="Sil / İptal" data-action="delete-order" data-id="${o.id}">
                    <i class="fa-solid fa-trash" style="font-size:18px; margin-bottom:2px;"></i>
                    <span style="font-weight:600;">Sil</span>
                </button>
                ` : ''}
            </div>
        </div>
        `;
    });
    container.innerHTML = html || '<div style="grid-column:1/-1; text-align:center; padding:50px; color:gray;">Henüz aktif bir planlama bulunmuyor.</div>';
    
    renderCuttingRecords();
}

function renderCuttingRecords() {
    const container = document.getElementById('cutting-records-container');
    if (!container) return;
    const activeOrders = mockData.orders.filter(o => o.status !== 'Tamamlandı');
    let html = '';
    
    getFiltered(activeOrders).forEach(o => {
        const firm = mockData.firms.find(f => f.id == o.firmId);
        const firmName = firm ? firm.name : 'Merkez Planlama';
        
        let fab = { name: '--', meter: '--', kg: '--', type: '--', rolls: '--' };
        let sampleUrl = '#', normalUrl = '#';

        try {
            if (o.assigned_file && o.assigned_file.startsWith('{')) {
                const extra = JSON.parse(o.assigned_file);
                if (extra.fabric) fab = extra.fabric;
                if (extra.drawings) {
                    const s = extra.drawings.find(f => f.category === 'SampleDrawing');
                    if (s) sampleUrl = s.url;
                    const n = extra.drawings.find(f => f.category === 'NormalDrawing');
                    if (n) normalUrl = n.url;
                }
            } else if (o.assigned_file) {
                normalUrl = o.assigned_file;
            }
        } catch(e) {}

        html += `
        <div class="model-card glass p-2" style="border-left: 5px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0;">${o.model}</h4>
                <span class="badge badge-info">${o.status}</span>
            </div>
            <div style="font-size:0.85rem; display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:10px;">
                <div><strong>Kumaş:</strong> ${fab.name}</div>
                <div><strong>Tür:</strong> ${fab.type}</div>
                <div><strong>Metre:</strong> ${fab.meter} m</div>
                <div><strong>Kg:</strong> ${fab.kg} kg</div>
                <div><strong>Top:</strong> ${fab.rolls}</div>
                <div><strong>Atölye:</strong> ${firmName}</div>
            </div>
            <div style="display:flex; gap:5px; margin-top:10px;">
                <button class="btn-primary" style="font-size:0.75rem; padding:5px; flex:1;" onclick="openFabricInfoModal('${o.id}')"><i class="fa-solid fa-layer-group"></i> Kumaş Gir</button>
                ${sampleUrl !== '#' ? `<a href="${sampleUrl}" target="_blank" class="btn-primary" style="font-size:0.75rem; padding:5px; flex:1; background:#e67e22; text-decoration:none; text-align:center;"><i class="fa-solid fa-pencil-ruler"></i> Numune</a>` : ''}
                ${normalUrl !== '#' ? `<a href="${normalUrl}" target="_blank" class="btn-primary" style="font-size:0.75rem; padding:5px; flex:1; background:var(--secondary); text-decoration:none; text-align:center;"><i class="fa-solid fa-file-pdf"></i> Seri</a>` : ''}
                <button class="btn-primary" style="font-size:0.75rem; padding:5px; flex:1; background:#27ae60;" onclick="openLotCreateModal('${o.id}')"><i class="fa-solid fa-scissors"></i> Kesim Yap</button>
            </div>
        </div>`;
    });
    container.innerHTML = html || '<div style="grid-column:1/-1; text-align:center; padding:50px; color:gray;">Aktif sipariş bulunmuyor.</div>';
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await supabaseClient.from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
            
        if(error) throw error;
        
        await addSystemLog(`Sipariş durumu güncellendi: ${orderId} -> ${newStatus}`);
        await loadData();
        renderPlanning();
        alert(`Sipariş durumu "${newStatus}" olarak güncellendi.`);
    } catch(e) {
        console.error(e);
        alert("Durum güncellenirken bir hata oluştu.");
    }
}

/*
// Lots (Obsolete duplicate, replaced by active renderLots below)
function renderLots() {
    const tbody = document.getElementById('lot-records');
    let html = '';
    getFiltered(mockData.lots).forEach(l => {
        html += `
        <tr>
            <td><strong>${l.lotNo}</strong></td>
            <td>${l.model}</td>
            <td>${l.qty}</td>
            <td><span class="badge ${l.badge}">${l.stage}</span></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="document.getElementById('custom-lot').value='${l.lotNo}'; document.querySelector('[data-subtarget=barcode-gen]').click();">Barkod</button>
                    ${l.stage === 'Üretimde' || l.stage === 'Sevkiyat' ? `<button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; background:#e67e22;" onclick="openCloseOrderModal('${l.order_id || ''}')"><i class="fa-solid fa-check-double"></i> Kapat</button>` : ''}
                </div>
            </td>
        </tr>
        `;
    });
    tbody.innerHTML = html;
}
*/

// Barcode Gen
window.generateBarcode = function() {
    const customLotEl = document.getElementById('custom-lot');
    if (!customLotEl) return;
    const val = customLotEl.value;
    if(!val) return;
    const txtEl = document.getElementById('barcode-text');
    if (txtEl) txtEl.innerText = val;
    const imgEl = document.getElementById('barcode-img');
    if (imgEl) imgEl.src = `https://barcode.tec-it.com/barcode.ashx?data=${val}&code=Code128`;
}

// Modal Logic
window.openAddPersonnelModal = function() {
    document.getElementById('add-personnel-modal').style.display = 'flex';
}

window.openAddModelModal = function() {
    document.getElementById('add-model-modal').style.display = 'flex';
}

window.closeModal = function(modalId) {
    const m = document.getElementById(modalId);
    if(m) m.style.display = 'none';
}

// Modal dışına tıklayınca kapatma
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ESC tuşuyla açık tüm modalları kapat
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(function(m) {
            m.style.display = 'none';
        });
    }
});

// Personnel CRUD
document.getElementById('add-personnel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-p-name').value;
    const dept = document.getElementById('new-p-dept').value;
    const shift = document.getElementById('new-p-shift').value;
    const firmId = currentUser ? currentUser.firmId : null;

    let finalName = name;
    if (currentUser && currentUser.firmId !== null) {
        const firm = mockData.firms.find(f => f.id === currentUser.firmId);
        if (firm) {
            finalName = `${firm.name}_personel_${name}`;
        }
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Kaydediliyor...";
    }

    try {
        const { error } = await supabaseClient.from('personnel').insert({
            name: finalName,
            dept: dept,
            shift: shift,
            firm_id: firmId
        });

        if (error) throw error;

        await addSystemLog(`Yeni personel eklendi: ${name}`);
        await loadData();
        renderPersonnel(); // DÜZELTME: renderLots yerine renderPersonnel çağrılmalı
        populateSelects();
        
        alert("✅ Personel başarıyla eklendi.");
        closeModal('add-personnel-modal');
        e.target.reset();
    } catch (err) {
        alert("❌ Hata: " + err.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Kaydet";
        }
    }
});

window.deletePersonnel = async function(id) {
    if(confirm('Bu personeli silmek istediğinize emin misiniz?')) {
        await supabaseClient.from('personnel').delete().eq('id', id);
        await loadData();
        renderPersonnel();
        populateSelects();
    }
}

// Lots Rendering
function renderLots() {
    const tbody = document.getElementById('lot-records');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    getFiltered(mockData.lots || []).forEach(l => {
        const order = mockData.orders.find(o => String(o.id) === String(l.order_id));
        const modelName = order ? order.model : 'Bilinmeyen';
        
        tbody.innerHTML += `
        <tr>
            <td><strong>${l.lot_no}</strong></td>
            <td>${modelName} / ${l.color || '-'}</td>
            <td>${l.qty} Adet</td>
            <td><span class="badge badge-info">${l.status || 'Kesildi'}</span></td>
            <td>
                <button class="btn-primary" style="padding:5px 10px; font-size:0.8rem;" onclick="generateBarcode('${l.lot_no}')">Barkod</button>
            </td>
        </tr>
        `;
    });
}

// History Logic
window.openPersonnelDetails = function(id) {
    const p = mockData.personnel.find(x => x.id === id);
    if(!p) return;
    
    document.getElementById('detail-modal-title').innerText = p.name + " - Detaylı Analiz";
    document.getElementById('history-personnel-id').value = id;
    
    renderHistory(id);
    document.getElementById('personnel-detail-modal').style.display = 'flex';
}

let personnelChartInstance = null;

function renderHistory(personnelId) {
    const p = mockData.personnel.find(x => x.id === parseInt(personnelId));
    if(!p) return;
    
    const tbody = document.getElementById('history-records');
    const records = mockData.studies.filter(s => s.name === p.name);
    let html = '';
    
    records.forEach((r) => {
        let badge = r.efficiency >= 100 ? 'badge-success' : (r.efficiency >= 85 ? 'badge-warning' : 'badge-danger');
        html += `
        <tr>
            <td>${r.time}</td>
            <td>${r.model || '-'}</td>
            <td>${r.amount}</td>
            <td>${r.target}</td>
            <td><span class="badge ${badge}">%${r.efficiency}</span></td>
        </tr>
        `;
    });
    
    if (records.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center;">Etüt kaydı bulunamadı.</td></tr>';
    }
    
    tbody.innerHTML = html;
    
    const ctx = document.getElementById('personnelChart');
    if(!ctx) return;
    
    if(personnelChartInstance) {
        personnelChartInstance.destroy();
    }
    
    // Reverse records to show oldest to newest on chart
    const chartRecords = [...records].reverse();
    const labels = chartRecords.map((r) => r.time + " (" + (r.model||"-") + ")");
    const data = chartRecords.map(r => r.efficiency);
    
    personnelChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Verimlilik (%)',
                data: data,
                backgroundColor: data.map(val => val >= 100 ? '#10b981' : (val >= 85 ? '#f59e0b' : '#ef4444')),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: Math.max(120, ...data, 0) }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

document.getElementById('add-model-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerText;
    
    try {
        btn.innerText = "Kaydediliyor...";
        btn.disabled = true;

        const customer = document.getElementById('new-m-customer').value;
        const name = document.getElementById('new-m-name').value;
        const qty = document.getElementById('new-m-qty').value;
        const start = document.getElementById('new-m-start').value || new Date().toISOString().split('T')[0];
        const end = document.getElementById('new-m-end').value || new Date().toISOString().split('T')[0];
        const firmValue = document.getElementById('new-m-firm').value;
        const firmId = (firmValue && !isNaN(parseInt(firmValue))) ? parseInt(firmValue) : null;
        
        const filesInput = document.getElementById('new-m-files');
        const imagesInput = document.getElementById('new-m-images');
        
        const uploadedFiles = [];
        
        // Trimkart / Teknik Dosyalar (Opsiyonel)
        if (filesInput && filesInput.files.length > 0) {
            for (let file of filesInput.files) {
                const res = await uploadFileToSupabase(file);
                if (res) uploadedFiles.push({ ...res, category: 'Technical' });
            }
        }
        
        // Model Görselleri (Opsiyonel)
        if (imagesInput && imagesInput.files.length > 0) {
            for (let file of imagesInput.files) {
                const res = await uploadFileToSupabase(file);
                if (res) uploadedFiles.push({ ...res, category: 'Image' });
            }
        }
        
        const newId = "ORD-" + Date.now().toString().slice(-6);
        
        const { error: insertError } = await supabaseClient.from('orders').insert({
            id: newId,
            customer: customer,
            model: name,
            qty: parseInt(qty) || 0,
            start_date: start,
            end_date: end,
            status: firmId ? "Kesimde" : "Planlandı",
            firm_id: firmId,
            assigned_file: uploadedFiles.length > 0 ? uploadedFiles[0].url : null
        });

        if (insertError) throw insertError;
        
        await addSystemLog(`Yeni sipariş oluşturuldu: ${name} (Müşteri: ${customer})`);
        
        // Verileri Tazele
        await loadData();
        renderPlanning();
        populateModelSelects();
        
        alert("✅ Sipariş başarıyla oluşturuldu ve listeye eklendi.");
        closeModal('add-model-modal');
        e.target.reset();

    } catch(err) {
        console.error("Kayıt Hatası:", err);
        alert("❌ Sipariş kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
    } finally {
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
});

// Form Removed

// Settings Operations
function renderSettingsOperations() {
    const tbody = document.getElementById('settings-op-list');
    const select = document.getElementById('model-op-select');
    
    let html = '';
    let selectHtml = '';
    
    mockData.settingsOperations.forEach(op => {
        html += `
        <tr>
            <td>${op.name}</td>
            <td>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteSettingOp(${op.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
        selectHtml += `<option value="${op.id}">${op.name}</option>`;
    });
    
    if (tbody) tbody.innerHTML = html;
    if (select) select.innerHTML = selectHtml;
}

function renderSharedFilesMain() {
    const list = document.getElementById('shared-files-list');
    if(!list) return;
    
    let files = mockData.sharedFiles || [];
    if(currentUser && currentUser.firmId !== null) {
        files = files.filter(f => String(f.firmId) === String(currentUser.firmId));
    }
    
    let html = '';
    files.forEach(f => {
        const sender = f.senderName || "Merkez";
        const isNew = !f.is_downloaded && currentUser && currentUser.firmId !== null;
        
        html += `
        <div class="file-card glass ${isNew ? 'file-new' : ''}" style="display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px; border-radius:10px; border-left: 5px solid ${isNew ? 'var(--secondary)' : 'transparent'};">
            <div>
                <h4 style="margin:5px 0; color:var(--secondary); font-size:1.1rem;">${f.title}</h4>
                <small style="color:gray;"><i class="fa-solid fa-user"></i> Gönderen: ${sender} | <i class="fa-solid fa-file"></i> ${f.fileName}</small>
            </div>
            <a href="${f.fileUrl}" target="_blank" onclick="markFileAsDownloaded('${f.id}')" class="btn-primary" style="text-decoration:none; padding:8px 15px;"><i class="fa-solid fa-download"></i> İndir</a>
        </div>
        `;
    });
    list.innerHTML = html;
}

const settingsOpForm = document.getElementById('settings-op-form');
if (settingsOpForm) {
    settingsOpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-op-name').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const { error } = await supabaseClient.from('settings_operations').insert({ name: name });
            if (error) throw error;
            await loadData();
            renderSettingsOperations();
            e.target.reset();
        } catch (error) {
            alert("Operasyon eklenirken hata: " + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

window.deleteSettingOp = async function(id) {
    if(confirm('Operasyonu silmek istediğinize emin misiniz?')) {
        try {
            const { error } = await supabaseClient.from('settings_operations').delete().eq('id', id);
            if (error) throw error;
            await loadData();
            renderSettingsOperations();
        } catch (error) {
            alert("Operasyon silinirken hata: " + error.message);
        }
    }
}

// Edit Model & Operations
window.openEditModelModal = function(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if(!order) return;
    
    document.getElementById('edit-modal-title').innerText = order.customer + " - " + order.model + " Düzenle";
    document.getElementById('edit-model-id').value = orderId;
    
    document.getElementById('edit-cutting-target').value = order.cuttingTarget || 0;
    
    // reset tabs to first tab
    const modalContent = document.querySelector('#edit-model-modal .modal-content');
    modalContent.querySelectorAll('.edit-sub-tab').forEach(t => t.classList.remove('active'));
    modalContent.querySelectorAll('.edit-sub-section').forEach(s => s.style.display = 'none');
    modalContent.querySelector('[data-subtarget="edit-kesim"]').classList.add('active');
    document.getElementById('edit-kesim').style.display = 'block';
    
    renderModelOperations(orderId);
    document.getElementById('edit-model-modal').style.display = 'flex';
}

window.saveCuttingTarget = function() {
    const orderId = document.getElementById('edit-model-id').value;
    const order = mockData.orders.find(o => o.id === orderId);
    if(order) {
        order.cuttingTarget = parseInt(document.getElementById('edit-cutting-target').value) || 0;
        saveData();
        alert('Kesim hedefi kaydedildi!');
    }
}

function renderModelOperations(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    const tbody = document.getElementById('model-operations-list');
    let html = '';
    
    if(order && order.operations) {
        order.operations.sort((a,b) => a.orderIndex - b.orderIndex).forEach(op => {
            const opRef = mockData.settingsOperations.find(so => so.id === op.opId);
            const opName = opRef ? opRef.name : "Bilinmeyen Operasyon";
            html += `
            <tr>
                <td>${op.orderIndex}</td>
                <td>${opName}</td>
                <td>${op.hourlyTarget}</td>
                <td>
                    <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteModelOp('${orderId}', ${op.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
            `;
        });
    }
    tbody.innerHTML = html;
}

const addModelOpForm = document.getElementById('add-model-op-form');
if (addModelOpForm) {
    addModelOpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderId = document.getElementById('edit-model-id').value;
    const order = mockData.orders.find(o => o.id === orderId);
    
    if(!order) return;
    if(!order.operations) order.operations = [];
    
    const opId = parseInt(document.getElementById('model-op-select').value);
    const orderIndex = parseInt(document.getElementById('model-op-order').value);
    const hourlyTarget = parseInt(document.getElementById('model-op-target').value);
    
    const newId = order.operations.length > 0 ? Math.max(...order.operations.map(o => o.id)) + 1 : 1;
    
    order.operations.push({
        id: newId,
        opId: opId,
        orderIndex: orderIndex,
        hourlyTarget: hourlyTarget
    });
    saveData();
    
        renderModelOperations(orderId);
        e.target.reset();
    });
}

window.deleteModelOp = function(orderId, opId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if(order && order.operations) {
        order.operations = order.operations.filter(o => o.id !== opId);
        saveData();
        renderModelOperations(orderId);
    }
}

// User Management
function renderUsers() {
    const container = document.getElementById('users-table-container');
    if (!container) return;

    const isAtolye = currentUser && currentUser.firmId !== null;

    // Dynamically adjust role select options based on user type
    const roleSelect = document.getElementById('new-u-role');
    if (roleSelect) {
        if (isAtolye) {
            roleSelect.innerHTML = `
                <option value="Atölye Admini">Atölye Admini</option>
                <option value="Planlamacı">Planlamacı</option>
                <option value="Kesimci">Kesimci</option>
                <option value="Etütçü">Etütçü</option>
                <option value="Etüt Sorumlusu">Etüt Sorumlusu</option>
                <option value="Sevkiyat">Sevkiyat</option>
            `;
        } else {
            roleSelect.innerHTML = `
                <option value="Admin">Admin (Merkez)</option>
                <option value="İmalat Admini">İmalat Admini (Merkez)</option>
                <option value="Planlamacı">Planlamacı</option>
                <option value="Kesimci">Kesimci</option>
                <option value="Etütçü">Etütçü</option>
                <option value="Etüt Sorumlusu">Etüt Sorumlusu</option>
                <option value="Sevkiyat">Sevkiyat</option>
                <option value="Müdür">Müdür</option>
                <option value="Patron">Patron</option>
                <option value="Atölye Admini">Atölye Admini</option>
            `;
        }
    }

    // Toggle firm select dropdown visibility based on user
    const firmSelectGroup = document.getElementById('user-firm-select-group');
    if (firmSelectGroup) {
        firmSelectGroup.style.display = isAtolye ? 'none' : 'block';
    }

    // Sort and filter users
    const filteredUsers = getFiltered(mockData.users || []);
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const firmA = mockData.firms.find(f => f.id === a.firmId)?.name || (a.role === 'Admin' || a.role === 'İmalat Admini' || a.role === 'malat Admini' ? "0_Merkez" : "Z_Bilinmeyen");
        const firmB = mockData.firms.find(f => f.id === b.firmId)?.name || (b.role === 'Admin' || b.role === 'İmalat Admini' || b.role === 'malat Admini' ? "0_Merkez" : "Z_Bilinmeyen");
        return firmA.localeCompare(firmB);
    });

    let tableHtml = '';
    if (isAtolye) {
        // Workshop view: Hide Atölye (Firma) column, strip username prefixes
        const firm = mockData.firms.find(f => f.id === currentUser.firmId);
        const firmName = firm ? firm.name : 'Atölye';
        tableHtml = `
            <h3>${firmName} Kullanıcıları</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Kullanıcı Adı</th>
                        <th>Rol / Yetki</th>
                        <th>Şifre</th>
                        <th style="width:50px;">İşlem</th>
                    </tr>
                </thead>
                <tbody id="settings-user-list">
        `;
        
        if (sortedUsers.length === 0) {
            tableHtml += '<tr><td colspan="4" style="text-align:center; padding:20px; color:gray;">Görüntülenecek kullanıcı bulunamadı.</td></tr>';
        } else {
            sortedUsers.forEach(u => {
                let displayName = u.username || '';
                const firm = mockData.firms.find(f => f.id === currentUser.firmId);
                if (firm) {
                    const prefix = firm.name.toLowerCase().replace(/\s/g, '') + "_";
                    if (displayName.startsWith(prefix)) {
                        displayName = displayName.replace(prefix, '');
                    }
                }
                
                tableHtml += `
                    <tr>
                        <td><strong>${displayName}</strong></td>
                        <td><span class="badge badge-primary">${u.role}</span></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="password" id="pass-${u.id}" value="${u.password}" readonly style="border:none; background:transparent; outline:none; width:80px; padding:0; margin:0;" />
                                <button type="button" id="toggle-${u.id}" style="background:none; border:none; color:var(--secondary); cursor:pointer;" onclick="togglePasswordVisibility('toggle-${u.id}', 'pass-${u.id}')">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        tableHtml += `</tbody></table>`;
    } else {
        // Central view: Show Atölye (Firma) column, show full usernames
        tableHtml = `
            <h3>Kayıtlı Atölyeler ve Kullanıcıları</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Atölye (Firma)</th>
                        <th>Kullanıcı Adı</th>
                        <th>Rol / Yetki</th>
                        <th>Şifre</th>
                        <th style="width:50px;">İşlem</th>
                    </tr>
                </thead>
                <tbody id="settings-user-list">
        `;
        
        if (sortedUsers.length === 0) {
            tableHtml += '<tr><td colspan="5" style="text-align:center; padding:20px; color:gray;">Görüntülenecek kullanıcı bulunamadı.</td></tr>';
        } else {
            sortedUsers.forEach(u => {
                const firm = mockData.firms.find(f => f.id === u.firmId);
                const firmName = firm ? firm.name : (u.role === 'Admin' || u.role === 'İmalat Admini' || u.role === 'malat Admini' ? "Sistem (Merkez)" : "Bilinmeyen Atölye");
                
                tableHtml += `
                    <tr>
                        <td><strong>${firmName}</strong></td>
                        <td>${u.username}</td>
                        <td><span class="badge badge-primary">${u.role}</span></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="password" id="pass-${u.id}" value="${u.password}" readonly style="border:none; background:transparent; outline:none; width:80px; padding:0; margin:0;" />
                                <button type="button" id="toggle-${u.id}" style="background:none; border:none; color:var(--secondary); cursor:pointer;" onclick="togglePasswordVisibility('toggle-${u.id}', 'pass-${u.id}')">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        tableHtml += `</tbody></table>`;
    }
    
    container.innerHTML = tableHtml;
}
window.togglePasswordVisibility = function(btnId, inputId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        input.type = "password";
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
}

window.deleteUser = async function(id) {
    if(currentUser && currentUser.id === id) {
        alert("Kendi hesabınızı silemezsiniz!");
        return;
    }
    if(confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) {
        try {
            const { error } = await supabaseClient.from('app_users').delete().eq('id', id);
            if (error) throw error;
            
            await loadData();
            renderUsers();
        } catch (error) {
            alert("Kullanıcı silinirken hata: " + error.message);
        }
    }
}

const settingsUserForm = document.getElementById('settings-user-form');
if (settingsUserForm) {
    settingsUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const uNameInput = document.getElementById('new-u-name');
        const uPassInput = document.getElementById('new-u-pass');
        const uRole = document.getElementById('new-u-role').value;
        const uFirmSelect = document.getElementById('new-u-firm');
        
        let uName = uNameInput.value.trim();
        const uPass = uPassInput.value.trim();
        
        // Determine firm_id: if workshop admin, use their own firmId. If central, use select value or null.
        let targetFirmId = null;
        if (currentUser.firmId !== null) {
            targetFirmId = currentUser.firmId;
        } else {
            const selectedVal = uFirmSelect ? uFirmSelect.value : '';
            targetFirmId = selectedVal ? parseInt(selectedVal) : null;
        }

        // Atölye ismiyle isim birleştirme (Zorunlu format)
        if (targetFirmId !== null) {
            const firm = mockData.firms.find(f => f.id === targetFirmId);
            if (firm) {
                const prefix = firm.name.toLowerCase().replace(/\s/g, '');
                if (!uName.startsWith(prefix + "_")) {
                    uName = prefix + "_" + uName;
                }
            }
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const { error } = await supabaseClient.from('app_users').insert({
                username: uName,
                password: uPass,
                role: uRole,
                firm_id: targetFirmId,
                permissions: rolePermissions[uRole] || ["overview", "work-study"]
            });
            if (error) throw error;

            await loadData();
            renderUsers();
            e.target.reset();
            alert("✅ Kullanıcı başarıyla eklendi: " + uName);
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// Manufacturing Tracking Logic
function renderFirms() {
    const container = document.getElementById('firms-list');
    if (!container) return;
    
    let html = '';
    getFiltered(mockData.firms).forEach(firm => {
        let badgeClass = firm.efficiency >= 100 ? 'badge-success' : (firm.efficiency >= 85 ? 'badge-warning' : 'badge-danger');
        html += `
        <div class="personnel-card glass" style="cursor: pointer; transition: transform 0.2s; position: relative;" onclick="openFirmDetails(${firm.id})">
            <button class="btn-danger" style="position: absolute; top: 10px; right: 10px; padding: 5px 8px; font-size: 0.75rem; z-index: 10;" 
                onclick="event.stopPropagation(); deleteFirm(${firm.id}, '${firm.name}')">
                <i class="fa-solid fa-trash"></i>
            </button>
            <div class="p-card-header">
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="p-avatar" style="background: var(--secondary);"><i class="fa-solid fa-industry"></i></div>
                    <div>
                        <h3 style="font-size:1.1rem; color:#2c3e50;">${firm.name}</h3>
                        <p style="font-size:0.85rem;">Aktif Model: ${firm.activeModels.length}</p>
                    </div>
                </div>
                <div style="display:flex; gap: 5px; align-items: center;">
                    <span class="badge ${badgeClass}">%${firm.efficiency}</span>
                </div>
            </div>
            <div style="margin-top:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.9rem;">
                    <span>Genel Verimlilik</span>
                    <strong>%${firm.efficiency}</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${firm.efficiency > 100 ? 100 : firm.efficiency}%; background-color: ${firm.efficiency >= 100 ? 'var(--success)' : (firm.efficiency >= 85 ? 'var(--warning)' : 'var(--danger)')}"></div>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}

window.openFirmDetails = function(id) {
    const firm = mockData.firms.find(f => f.id === id);
    if (!firm) return;

    document.getElementById('firm-modal-title').innerText = firm.name + " - Detayları";
    
    // Aktif Siparişler / Aşamalar
    const tbodyModels = document.getElementById('firm-active-models-table');
    let modelsHtml = '';
    const firmOrders = mockData.orders.filter(o => o.firmId === id);
    
    firmOrders.forEach(o => {
        let dict = {
            "Dikimdeki": Math.floor(o.qty * 0.3),
            "Ütü/Paket": Math.floor(o.qty * 0.2),
            "Kalite Kontrol": Math.floor(o.qty * 0.1),
            "Depoya Giren": Math.floor(o.qty * 0.1),
        }
        modelsHtml += `
        <tr>
            <td>${o.customer} / ${o.model}</td>
            <td>${o.qty}</td>
            <td>${dict["Dikimdeki"]}</td>
            <td>${dict["Ütü/Paket"]}</td>
            <td>${dict["Kalite Kontrol"]}</td>
            <td>${dict["Depoya Giren"]}</td>
            <td>${o.end}</td>
        </tr>
        `;
    });
    
    if(firmOrders.length === 0) {
        modelsHtml = '<tr><td colspan="7" style="text-align:center;">Aktif sipariş bulunamadı.</td></tr>';
    }
    if (tbodyModels) tbodyModels.innerHTML = modelsHtml;
    
    // Etüt Bilgileri
    const studiesContainer = document.getElementById('firm-study-records');
    let studyHtml = '';
    const firmStudies = mockData.studies.filter(s => s.firmId === id).slice(0, 5); // Son 5 etüt
    firmStudies.forEach(s => {
        let badgeClass = s.efficiency >= 100 ? 'badge-success' : (s.efficiency >= 85 ? 'badge-warning' : 'badge-danger');
        studyHtml += `
        <tr>
            <td>${s.dept}</td>
            <td>${s.model || "-"}</td>
            <td>${s.target}</td>
            <td>${s.amount}</td>
            <td><span class="badge ${badgeClass}">%${s.efficiency}</span></td>
        </tr>
        `;
    });
    if (firmStudies.length === 0) {
        studyHtml = '<tr><td colspan="5" style="text-align:center;">Etüt verisi bulunamadı.</td></tr>';
    }
    if (studiesContainer) studiesContainer.innerHTML = studyHtml;
    
    document.getElementById('firm-detail-modal').style.display = 'flex';
}

window.openAddFirmModal = function() {
    document.getElementById('add-firm-modal').style.display = 'flex';
}

document.getElementById('add-firm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firmName = document.getElementById('new-firm-name').value;
    const adminUser = document.getElementById('new-firm-admin-user').value;
    const adminPass = document.getElementById('new-firm-admin-pass').value;
    
    const { data: firmData, error: firmError } = await supabaseClient.from('firms').insert({
        name: firmName,
        efficiency: 0,
        status: "Aktif",
        shipments: "Yeni Atölye",
        active_models: []
    }).select();
    
    if(firmData && firmData.length > 0) {
        const newFirmId = firmData[0].id;
        await supabaseClient.from('app_users').insert({
            username: adminUser,
            password: adminPass,
            role: "Atölye Admini",
            firm_id: newFirmId,
            permissions: ["overview", "personnel", "work-study", "planning", "barcode", "settings"]
        });
        
    await addSystemLog(`Yeni atölye eklendi: ${firmName}`, null);
    await loadData();
    renderFirms();
    closeModal('add-firm-modal');
    e.target.reset();
}
});

window.deleteFirm = async function(id, name) {
if(confirm(`"${name}" atölyesini ve bu atölyeye ait tüm verileri (kullanıcılar, personel, siparişler) silmek istediğinize emin misiniz?`)) {
    try {
        const { error } = await supabaseClient.from('firms').delete().eq('id', id);
        if(error) throw error;
        
        await addSystemLog(`Atölye silindi: ${name}`, null);
        await loadData();
        renderFirms();
        alert('Atölye başarıyla silindi.');
    } catch (e) {
        console.error("Silme hatası:", e);
        alert('Atölye silinirken bir hata oluştu.');
    }
}
}

// Language Support
const i18n = {
    en: {
        "Sisteme giriş yapın": "Login to the system",
        "Kullanıcı Adı": "Username",
        "Åžifre": "Password",
        "Beni Hatırla": "Remember Me",
        "Giriş Yap": "Login",
        "Genel Bakış": "Overview",
        "Personel": "Personnel",
        "Etüt Girişi": "Work Study",
        "Yükleme Tahmini": "Loading Estimate",
        "Planlama & Kesim": "Planning & Cutting",
        "Barkod & Sevkiyat": "Barcode & Shipping",
        "Ayarlar": "Settings",
        "Günlük Üretim": "Daily Production",
        "Aktif Personel": "Active Personnel",
        "Ortalama Verimlilik": "Avg Efficiency",
        "Saatlik Üretim Grafiği": "Hourly Production Chart",
        "Departman Verimliliği": "Dept Efficiency",
        "Personel Listesi": "Personnel List",
        "Yeni Ekle": "Add New",
        "Yeni Etüt Kaydı": "New Study Record",
        "Model / Sipariş": "Model / Order",
        "Operasyon": "Operation",
        "Önce Model Seçin": "Select Model First",
        "Operasyon Seçin": "Select Operation",
        "Model Seçin": "Select Model",
        "Saat Dilimi": "Time Slot",
        "Saatlik Hedef": "Hourly Target",
        "Gerçekleşen Adet": "Actual Amount",
        "Kaydet": "Save",
        "Son Etüt Kayıtları": "Recent Study Records",
        "Departman": "Department",
        "Saat": "Time",
        "Adet": "Amount",
        "Verimlilik Durumu": "Efficiency Status",
        "Sipariş Tahmin Hesaplayıcı": "Order Estimation Calculator",
        "Sipariş Adedi": "Order Quantity",
        "Günlük Hedef Kapasite (Adet)": "Daily Target Capacity (Qty)",
        "Fazla Mesai Çarpanı (%)": "Overtime Multiplier (%)",
        "Hesapla": "Calculate",
        "Tahmin Sonucu": "Estimation Result",
        "Siparişin tamamlanması için öngörülen süre.": "Estimated time to complete the order.",
        "Gün": "Days",
        "Planlama": "Planning",
        "Kesimhane": "Cutting Room",
        "Sipariş Zaman Çizelgesi": "Order Timeline",
        "Yeni Model Ekle": "Add New Model",
        "Model/Müşteri": "Model/Customer",
        "Başlangıç": "Start",
        "Teslim": "Delivery",
        "Durum": "Status",
        "İşlem": "Action",
        "Kesim Emirleri": "Cutting Orders",
        "Lot Takibi": "Lot Tracking",
        "Barkod Üret": "Generate Barcode",
        "Sevkiyat": "Shipping",
        "Aktif Lotlar": "Active Lots",
        "Lot No": "Lot No",
        "Model/Renk": "Model/Color",
        "Aşama": "Stage",
        "Barkod Simülasyonu": "Barcode Simulation",
        "Oluştur": "Generate",
        "Sevkiyat Planı": "Shipping Plan",
        "Müşteri / Hedef": "Customer / Destination",
        "Lot Barkodları (Virgülle ayırın)": "Lot Barcodes (Comma separated)",
        "İrsaliye Oluştur": "Create Waybill",
        "Operasyon Ayarları": "Operation Settings",
        "Kullanıcı Ayarları": "User Settings",
        "Ses Ayarları": "Sound Settings",
        "Dil Seçenekleri": "Language Options",
        "Yeni Operasyon Tanımla": "Define New Operation",
        "Operasyon Adı": "Operation Name",
        "Ekle": "Add",
        "Kayıtlı Operasyonlar": "Registered Operations",
        "Yeni Kullanıcı Ekle": "Add New User",
        "Kullanıcı Rolü / Ünvanı": "User Role / Title",
        "Erişim Yetkileri (Görebileceği Sayfalar)": "Access Permissions (Pages)",
        "Kayıtlı Kullanıcılar": "Registered Users",
        "Rol": "Role",
        "Yetkiler": "Permissions",
        "Sistem Ses Ayarları": "System Sound Settings",
        "Bildirim Sesi": "Notification Sound",
        "Uyarı Zili (Hata Durumu)": "Warning Bell (Error State)",
        "Ayarları Kaydet": "Save Settings",
        "Sistem Dili": "System Language",
        "Varsayılan Dil": "Default Language",
        "Dili Değiştir": "Change Language",
        "Detaylı Analiz": "Detailed Analysis",
        "Misafir": "Guest",
        "Rol Bekleniyor": "Pending Role",
        "Çıkış": "Logout",
        "Ad Soyad": "Full Name",
        "Vardiya": "Shift",
        "Tarih": "Date",
        "Bölüm / Departman": "Department",
        "Müşteri / Marka": "Customer / Brand",
        "Model Adı": "Model Name",
        "Başlangıç Tarihi": "Start Date",
        "Teslim Tarihi": "Delivery Date",
        "Model Düzenle": "Edit Model",
        "Kesim": "Cutting",
        "Dikim": "Sewing",
        "Aksesuar & Malzeme": "Accessories & Materials",
        "Numune": "Sample",
        "Kesim Hedefleri": "Cutting Targets",
        "Saatlik Atılması Gereken Kat Hedefi": "Hourly Layer Target",
        "Hedefi Kaydet": "Save Target",
        "Sıra No (Örn: 1, 2, 3)": "Order No (e.g. 1, 2, 3)",
        "Modele Eklenen Operasyonlar": "Operations Added to Model",
        "Sıra No": "Order No",
        "Aksesuar ve Malzeme İhtiyaçları": "Accessory and Material Needs",
        "Bu bölüm modele ait iplik, düğme, fermuar gibi yan malzemelerin takibi için ayrılmıştır.": "This section is reserved for tracking auxiliary materials like threads, buttons, and zippers.",
        "Numune Durumu": "Sample Status",
        "Bu bölüm modelin ön üretim / numune onay sürecinin takibi için ayrılmıştır.": "This section is reserved for tracking the pre-production / sample approval process.",
        "Geçmiş Operasyon Ekle": "Add Past Operation",
        "Geçmiş Operasyon Verileri": "Past Operation Data",
        "Personel Detayı": "Personnel Details",
        "Sistem Yöneticisi": "System Admin",
        "Etüt Sorumlusu": "Study Manager",
        "Geliştirici": "Developer",
        "Patron": "Boss",
        "Müdür": "Manager",
        "Etütçü": "Study Specialist",
        "Planlamacı": "Planner",
        "Kesimci": "Cutter",
        "Ütü/Paket": "Ironing/Packaging",
        "Üretimde": "In Production",
        "Kesimde": "In Cutting",
        "Planlandı": "Planned",
        "Kadın Elbise": "Women's Dress",
        "Erkek T-Shirt": "Men's T-Shirt",
        "Çocuk Pantolon": "Children's Pants",
        "Paketleme": "Packaging",
        "İmalat Takip": "Manufacturing Tracking",
        "Aktif Atölye ve Fabrikalar": "Active Workshops and Factories",
        "Firma Detayları": "Firm Details",
        "Şu An Aktif Modeller": "Currently Active Models",
        "Son Etüt Bilgileri": "Latest Study Information",
        "Sevkiyat Durumu": "Shipment Status",
        "Genel Verimlilik": "Overall Efficiency",
        "Etüt verisi bulunamadı.": "No study data found.",
        "Aktif Model": "Active Model",
        "Gerçekleşen": "Actual",
        "Hedef": "Target",
        "Detayları": "Details"
    }
};

function traverseAndTranslate(node, isEn) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue.trim();
        if (text.length > 0 && isNaN(text)) {
            if (!node.originalText) {
                node.originalText = text;
            }
            let key = node.originalText;
            if (isEn && i18n.en[key]) {
                node.nodeValue = node.nodeValue.replace(text, i18n.en[key]);
            } else if (!isEn && node.originalText) {
                node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), node.originalText);
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') return;
        
        if (node.hasAttribute('placeholder')) {
            if (!node.originalPlaceholder) {
                node.originalPlaceholder = node.getAttribute('placeholder');
            }
            let key = node.originalPlaceholder;
            if (isEn && i18n.en[key]) {
                node.setAttribute('placeholder', i18n.en[key]);
            } else if (!isEn && node.originalPlaceholder) {
                node.setAttribute('placeholder', node.originalPlaceholder);
            }
        }
        
        node.childNodes.forEach(child => traverseAndTranslate(child, isEn));
    }
}

let currentLang = 'tr';

window.changeLanguage = function() {
    currentLang = document.getElementById('lang-select').value;
    const isEn = currentLang === 'en';
    traverseAndTranslate(document.body, isEn);
}

// Observer to automatically translate dynamically rendered tables/lists
const langObserver = new MutationObserver((mutations) => {
    if (currentLang !== 'en') return;
    
    // Disconnect temporarily to prevent infinite loops during translation
    langObserver.disconnect();
    
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                traverseAndTranslate(node, true);
            }
        });
    });
    
    // Reconnect
    langObserver.observe(document.body, { childList: true, subtree: true });
});

// File Sharing Logic Main
const fileShareFormMain = document.getElementById('file-share-form-main');
if (fileShareFormMain) {
    fileShareFormMain.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const title = document.getElementById('share-file-title-main').value;
        const type = document.getElementById('share-file-type-main').value;
        const firmId = parseInt(document.getElementById('share-file-firm-main').value);
        const fileInput = document.getElementById('share-file-input-main');
        
        if (fileInput.files.length === 0) return;
        
        const uploadRes = await uploadFileToSupabase(fileInput.files[0]);
        if (!uploadRes) return;
        
        const { error: insertError } = await supabaseClient.from('shared_files').insert({
            time: new Date().toISOString(),
            firm_id: firmId,
            title: `${title} (${type})`,
            file_name: uploadRes.name,
            file_url: uploadRes.url,
            sender_name: currentUser ? currentUser.username : "Sistem",
            metadata: { category: type }
        });
        
        if (insertError) {
            console.error("Veritabanı Yazma Hatası:", insertError);
            alert("❌ Veritabanına kaydedilemedi: " + insertError.message);
            return;
        }
        
        alert("✅ Dosya başarıyla gönderildi!");
        await addSystemLog(`Yeni dosya gönderildi: ${title} - ${type}`);
        await loadData();
        renderSharedFilesMain();
        e.target.reset();
    } catch (err) {
        console.error("Beklenmedik Hata:", err);
        alert("❌ İşlem sırasında bir hata oluştu.");
    }
    });
}

window.renderSharedFilesMain = function() {
    const list = document.getElementById('shared-files-list-main');
    if(!list) return;
    
    const isAtolye = currentUser && currentUser.firmId !== null;
    
    // UI Hiding
    const uploadTabBtn = document.getElementById('tab-files-upload');
    if(uploadTabBtn) uploadTabBtn.style.display = isAtolye ? 'none' : 'inline-block';
    
    const filterCat = document.getElementById('filter-file-type').value;
    const filterDate = document.getElementById('filter-file-date').value;

    let files = [...(mockData.sharedFiles || [])];
    
    // Base Filter for Atölye
    if(isAtolye && currentUser.firmId != null) {
        files = files.filter(f => String(f.firmId) === String(currentUser.firmId));
    }
    
    // Dynamic Filter
    if(filterCat !== 'Tümü') {
        files = files.filter(f => f.title.includes(filterCat));
    }
    if(filterDate) {
        files = files.filter(f => f.time.startsWith(filterDate));
    }

    let html = '';
    files.forEach(f => {
        let firmName = "-";
        const firmRef = mockData.firms.find(x => x.id == f.firmId);
        if(firmRef) firmName = firmRef.name;
        
        let sender = f.senderName || "Sistem";
        let dateObj = new Date(f.time);
        let dateStr = dateObj.toLocaleDateString('tr-TR') + ' ' + dateObj.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
        
        let statusHtml = '';
        if(!isAtolye) {
            statusHtml = f.is_downloaded 
                ? `<span style="color:var(--success); font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> Atölye İndirdi</span>`
                : `<span style="color:gray; font-size:0.8rem;"><i class="fa-solid fa-clock"></i> Henüz Görülmedi</span>`;
        } else if(!f.is_downloaded) {
            statusHtml = `<span class="badge-notify" style="position:static; margin-left:10px;">YENİ</span>`;
        }

        html += `
        <div class="notify-item" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.8); margin-bottom:12px; border-left:6px solid var(--primary); padding:15px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <div>
                <small style="color:var(--primary); font-weight:bold;">${dateStr} | ${firmName} ${statusHtml}</small>
                <h4 style="margin:5px 0; color:var(--secondary); font-size:1.1rem;">${f.title}</h4>
                <small style="color:gray;"><i class="fa-solid fa-user"></i> Gönderen: ${sender} | <i class="fa-solid fa-file"></i> ${f.fileName}</small>
            </div>
            <a href="${f.fileUrl}" target="_blank" onclick="markFileAsDownloaded('${f.id}')" class="btn-primary" style="text-decoration:none; padding:8px 15px;"><i class="fa-solid fa-download"></i> İndir</a>
        </div>
        `;
    });
    
    if(files.length === 0) {
        html = '<div style="text-align:center; color:gray; padding:50px;">Filtrelere uygun dosya bulunamadı.</div>';
    }
    
    list.innerHTML = html;
}

window.markFileAsDownloaded = async function(fileId) {
    if(!currentUser || currentUser.firmId == null) return; // Only workshops mark as read
    
    try {
        await supabaseClient.from('shared_files')
            .update({ is_downloaded: true, downloaded_at: new Date().toISOString() })
            .eq('id', fileId);
        
        // Update local data
        const file = mockData.sharedFiles.find(f => f.id == fileId);
        if(file) file.is_downloaded = true;
        
        renderSharedFilesMain();
    } catch(e) { console.error("Mark read error:", e); }
}

// Keep old renderSharedFiles for backward compatibility if needed elsewhere
function renderSharedFiles() { renderSharedFilesMain(); }

function renderLogs() {
    const tbody = document.getElementById('logs-list');
    if (!tbody) return;
    
    let html = '';
    // Sadece son 20 logu arayüzde göster
    getFiltered(mockData.systemLogs || []).slice(0, 20).forEach(log => {
        let firmName = "-";
        if(log.firmId !== null && log.firmId !== undefined) {
            const f = mockData.firms.find(x => x.id === log.firmId);
            if(f) firmName = f.name;
        } else {
            firmName = "Merkez (İmalat)";
        }
        
        html += `
        <tr>
            <td>${log.time}</td>
            <td><strong>${firmName}</strong><br><small style="color:var(--secondary);">${log.user}</small></td>
            <td>${log.action}</td>
        </tr>
        `;
    });
    
    if(!mockData.systemLogs || mockData.systemLogs.length === 0) {
        html = '<tr><td colspan="3" style="text-align:center;">Kayıt bulunamadı.</td></tr>';
    }
    
    tbody.innerHTML = html;
}

window.openLotCreateModal = function(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if(!order) return;
    
    document.getElementById('lot-order-id').value = orderId;
    document.getElementById('lot-model-name').innerText = order.model;
    document.getElementById('lot-order-total').innerText = order.qty;
    
    // Reset fields
    document.getElementById('lot-fabric-no').value = '';
    document.getElementById('lot-manual-no').value = '';
    document.getElementById('lot-color').value = '';
    document.getElementById('lot-qty').value = order.qty;
    
    document.getElementById('lot-create-modal').style.display = 'flex';
}

document.getElementById('lot-entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('lot-order-id').value;
    const fabricLot = document.getElementById('lot-fabric-no').value;
    const prodLot = document.getElementById('lot-manual-no').value;
    const color = document.getElementById('lot-color').value;
    const qty = parseInt(document.getElementById('lot-qty').value);
    
    const order = mockData.orders.find(o => o.id === orderId);
    if(!order) return;

    try {
        const { error: lotError } = await supabaseClient.from('lots').insert({
            lot_no: prodLot, 
            firm_id: order.firmId,
            model: `${order.model} (${color})`,
            qty: qty,
            stage: 'Dikim Bekliyor',
            badge: 'badge-warning',
            order_id: orderId,
            metadata: { fabric_lot: fabricLot, color: color }
        });
        if(lotError) throw lotError;
        
        const { error: orderError } = await supabaseClient.from('orders')
            .update({ status: 'Üretimde' })
            .eq('id', orderId);
        if(orderError) throw orderError;

        await addSystemLog(`Kesim Tamamlandı: Üretim No: ${prodLot}, Kumaş Lot: ${fabricLot}, Renk: ${color}`);
        await loadData();
        renderPlanning();
        closeModal('lot-create-modal');
        alert(`✅ ${prodLot} numaralı üretim birimi başarıyla oluşturuldu.`);
    } catch(e) {
        console.error(e);
        alert("Kayıt sırasında bir hata oluştu.");
    }
});

window.openAssignFirmModal = function(orderId) {
    const orderIdInput = document.getElementById('assign-order-id');
    if (orderIdInput) orderIdInput.value = orderId;
    
    const select = document.getElementById('assign-firm-select');
    if (select) {
        select.innerHTML = '<option value="">Atölye Seçiniz...</option>';
        mockData.firms.forEach(f => {
            select.innerHTML += `<option value="${f.id}">${f.name}</option>`;
        });
    }
    
    const modal = document.getElementById('assign-firm-modal');
    if (modal) modal.style.display = 'flex';
}

document.getElementById('assign-firm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('assign-order-id').value;
    const firmValue = document.getElementById('assign-firm-select').value;
    const firmId = (firmValue && !isNaN(parseInt(firmValue))) ? parseInt(firmValue) : null;
    
    if(!firmId) return alert("Lütfen bir atölye seçin.");

    try {
        const { error } = await supabaseClient.from('orders')
            .update({ firm_id: firmId, status: 'Kesimde' })
            .eq('id', orderId);
            
        if(error) throw error;
        
        await addSystemLog(`Sipariş atölyeye atandı: ${orderId} -> Atölye ID: ${firmId}`);
        
        await loadData();
        renderPlanning();
        closeModal('assign-firm-modal');
        alert("✅ Sipariş başarıyla atölyeye aktarıldı.");
    } catch(e) {
        console.error(e);
        alert("Atama yapılırken bir hata oluştu.");
    }
});

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await supabaseClient.from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
            
        if(error) throw error;
        
        await addSystemLog(`Sipariş durumu güncellendi: ${orderId} -> ${newStatus}`);
        await loadData();
        renderPlanning();
        renderCuttingRecords();
        alert(`✅ Sipariş durumu '${newStatus}' olarak güncellendi.`);
    } catch(e) {
        console.error(e);
        alert("Durum güncellenirken bir hata oluştu.");
    }
}

window.renderCompletedOrders = function() {
    const list = document.getElementById('completed-orders-list');
    const statsDiv = document.getElementById('completed-stats');
    if(!list) return;

    const completed = mockData.orders.filter(o => o.status === 'Tamamlandı');
    let html = '';
    let totalQty = 0;

    completed.forEach(o => {
        totalQty += (o.qty || 0);
        const firm = mockData.firms.find(f => f.id == o.firmId);
        const inspectionUrl = (o.metadata && o.metadata.inspection_report) ? o.metadata.inspection_report : '#';
        
        html += `
        <tr>
            <td><strong>${o.model}</strong><br><small>${o.customer}</small></td>
            <td>${firm ? firm.name : 'Merkez'}</td>
            <td>${o.qty} Adet</td>
            <td>${new Date(o.updated_at || Date.now()).toLocaleDateString('tr-TR')}</td>
            <td>
                ${inspectionUrl !== '#' 
                    ? `<a href="${inspectionUrl}" target="_blank" class="btn-primary" style="padding:4px 8px; font-size:0.8rem;"><i class="fa-solid fa-file-pdf"></i> Raporu Gör</a>`
                    : '<span style="color:gray;">Rapor Yok</span>'}
            </td>
            <td><span class="badge badge-success">Tamamlandı</span></td>
        </tr>
        `;
    });

    list.innerHTML = html || '<tr><td colspan="6" style="text-align:center; padding:30px; color:gray;">Henüz tamamlanmış bir sipariş bulunmuyor.</td></tr>';
    
    if(statsDiv) {
        statsDiv.innerHTML = `
            <span><strong>Toplam Model:</strong> ${completed.length}</span>
            <span><strong>Toplam Üretim:</strong> ${totalQty} Adet</span>
        `;
    }
}

window.openCloseOrderModal = function(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if(!order) return;
    
    document.getElementById('close-order-id').value = orderId;
    document.getElementById('close-final-qty').value = order.qty;
    document.getElementById('close-order-modal').style.display = 'flex';
}

document.getElementById('close-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('close-order-id').value;
    const finalQty = document.getElementById('close-final-qty').value;
    const notes = document.getElementById('close-notes').value;
    const fileInput = document.getElementById('close-inspection-file');
    
    if(fileInput.files.length === 0) return alert("Lütfen Inspection raporunu yükleyin.");

    try {
        // 1. Raporu yükle
        const uploadRes = await uploadFileToSupabase(fileInput.files[0]);
        if(!uploadRes) return;

        // 2. Siparişi güncelle
        const { error } = await supabaseClient.from('orders')
            .update({ 
                status: 'Tamamlandı',
                qty: parseInt(finalQty)
            })
            .eq('id', orderId);
            
        if(error) throw error;
        
        await addSystemLog(`Sipariş Tamamlandı ve Arşivlendi: ${orderId}`);
        await loadData();
        renderPlanning();
        closeModal('close-order-modal');
        alert("✅ Sipariş başarıyla arşivlendi.");
    } catch(e) {
        console.error(e);
        alert("Dosya kapatılırken bir hata oluştu.");
    }
});

window.refreshPlanning = async function() {
    const btn = document.querySelector('button[title="Yenile"] i');
    if(btn) btn.classList.add('fa-spin');
    
    await loadData();
    renderPlanning();
    
    if(btn) setTimeout(() => btn.classList.remove('fa-spin'), 1000);
}

window.openModelDetailsOriginal = function(orderId) {
    console.log("openModelDetails tetiklendi (V2). Sipariş ID:", orderId);
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if(!order) {
        alert("Sipariş verisi bulunamadı! ID: " + orderId);
        return;
    }
    
    const modal = document.getElementById('edit-model-modal');
    if(!modal) {
        alert("Hata: 'edit-model-modal' bulunamadı! Lütfen sayfayı yenileyin.");
        return;
    }

    // Modalın en üstte olduğundan emin ol
    modal.style.zIndex = "20000";
    modal.style.display = 'flex';
    console.log("Modal display 'flex' yapıldı.");

    // Elementleri güvenle doldur
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
    const setInner = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val || ''; };

    setVal('edit-m-id', orderId);
    setVal('edit-m-customer', order.customer);
    setVal('edit-m-name', order.model);
    setVal('edit-m-qty', order.qty);
    setVal('edit-m-start', order.start_date);
    setVal('edit-m-end', order.end_date);
    
    // Yeni Alanlar
    setVal('edit-m-accessories', '');
    setVal('edit-m-sample-note', '');
    setVal('edit-fab-name', '--');
    setVal('edit-fab-type', '--');
    setVal('edit-fab-meter', '--');
    setVal('edit-fab-kg', '--');
    setVal('edit-fab-rolls', '--');

    // Çizim & Görsel Hazırlık
    setInner('current-sample-file', '<span style="color:gray;">Numune yüklü değil</span>');
    setInner('current-normal-files', '<span style="color:gray;">Seri çizim yüklü değil</span>');

    // Görseller
    const imgDiv = document.getElementById('current-model-images');
    if(imgDiv) imgDiv.innerHTML = '<span style="color:gray;">Görsel yüklü değil</span>';

    try {
        if (order.assigned_file && order.assigned_file.startsWith('{')) {
            const extra = JSON.parse(order.assigned_file);
            
            if (extra.fabric) {
                setVal('edit-fab-name', extra.fabric.name);
                setVal('edit-fab-type', extra.fabric.type);
                setVal('edit-fab-meter', extra.fabric.meter);
                setVal('edit-fab-kg', extra.fabric.kg);
                setVal('edit-fab-rolls', extra.fabric.rolls);
            }

            if (extra.accessories) setVal('edit-m-accessories', extra.accessories);
            if (extra.sample_note) setVal('edit-m-sample-note', extra.sample_note);

            if (extra.drawings) {
                const s = extra.drawings.find(f => f.category === 'SampleDrawing');
                if (s) setInner('current-sample-file', `<a href="${s.url}" target="_blank" style="color:var(--primary); font-weight:600;"><i class="fa-solid fa-file-pdf"></i> Mevcut Numune Çizimi</a>`);
                
                const normals = extra.drawings.filter(f => f.category === 'NormalDrawing');
                if (normals.length > 0) {
                    setInner('current-normal-files', normals.map(n => `<div style="margin-bottom:5px;"><a href="${n.url}" target="_blank" style="color:var(--secondary);"><i class="fa-solid fa-file-circle-check"></i> ${n.name}</a></div>`).join(''));
                }

                const imgs = extra.drawings.filter(f => f.category === 'Image');
                if (imgs.length > 0 && imgDiv) {
                    imgDiv.innerHTML = imgs.map(im => `
                        <div style="position:relative; width:80px; height:80px;">
                            <img src="${im.url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; cursor:pointer; border:2px solid #eee;" onclick="openLightbox('${im.url}', '${order.model}')">
                            <button onclick="deleteModelImage('${order.id}', '${im.url}')" style="position:absolute; top:-5px; right:-5px; width:20px; height:20px; border-radius:50%; background:red; color:white; border:none; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);">×</button>
                        </div>
                    `).join('');
                }
            }
        } else if (order.assigned_file) {
            setInner('current-normal-files', `<a href="${order.assigned_file}" target="_blank"><i class="fa-solid fa-file"></i> Mevcut Dosya</a>`);
        }
    } catch(e) { console.error("Detay ayrıştırma hatası:", e); }

    // Eski görselleri temizle (Eski yapıdan kalan varsa)
    const drawingsTab = document.getElementById('edit-m-drawings');
    if (drawingsTab) {
        const existingImgs = drawingsTab.querySelector('.model-images-preview');
        if (existingImgs) existingImgs.remove();
    }

    // Reset tabs
    modal.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    modal.querySelectorAll('.sub-section').forEach(s => s.style.display = 'none');
    const genTab = modal.querySelector('[data-subtarget="edit-m-general"]');
    if(genTab) genTab.classList.add('active');
    const genSec = document.getElementById('edit-m-general');
    if(genSec) genSec.style.display = 'block';

    modal.style.display = 'flex';
}

window.openFabricInfoModal = function(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    if(!order) return;
    
    document.getElementById('fabric-order-id').value = orderId;
    
    // Mevcut kumaş bilgilerini çek (JSON formatında ise)
    let fab = { name: '', meter: '', kg: '', type: 'Örme', rolls: '' };
    try {
        if (order.description && order.description.startsWith('{')) {
            fab = JSON.parse(order.description);
        }
    } catch(e) {}
    
    document.getElementById('fab-name').value = fab.name;
    document.getElementById('fab-meter').value = fab.meter;
    document.getElementById('fab-kg').value = fab.kg;
    document.getElementById('fab-type').value = fab.type;
    document.getElementById('fab-rolls').value = fab.rolls;
    
    document.getElementById('fabric-info-modal').style.display = 'flex';
}

document.getElementById('fabric-info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('fabric-order-id').value;
    const fabData = {
        name: document.getElementById('fab-name').value,
        meter: document.getElementById('fab-meter').value,
        kg: document.getElementById('fab-kg').value,
        type: document.getElementById('fab-type').value,
        rolls: document.getElementById('fab-rolls').value
    };
    
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Kaydediliyor...";
    btn.disabled = true;

    try {
        const order = mockData.orders.find(o => o.id === orderId);
        let extra = { fabric: fabData, drawings: [] };
        
        // Mevcut çizimleri koru
        if (order.assigned_file && order.assigned_file.startsWith('{')) {
            const prev = JSON.parse(order.assigned_file);
            extra.drawings = prev.drawings || [];
        }

        const { error } = await supabaseClient.from('orders')
            .update({ assigned_file: JSON.stringify(extra) })
            .eq('id', orderId);
        
        if (error) throw error;
        
        await loadData();
        renderCuttingRecords();
        closeModal('fabric-info-modal');
        alert("✅ Kumaş bilgileri başarıyla kaydedildi.");
    } catch(err) {
        console.error(err);
        alert("❌ Kayıt Hatası: " + (err.message || "Bilinmeyen bir hata oluştu"));
    } finally {
        btn.innerText = "Kumaş Bilgilerini Kaydet";
        btn.disabled = false;
    }
});

// Modal Tab Switcher Logic
document.addEventListener('click', (e) => {
    const tab = e.target.closest('.sub-tab');
    if (tab && tab.closest('.modal-content')) {
        const container = tab.closest('.modal-content');
        const target = tab.getAttribute('data-subtarget');
        
        container.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.sub-section').forEach(s => s.style.display = 'none');
        
        tab.classList.add('active');
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.style.display = 'block';
    }
});

document.getElementById('edit-model-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-m-id').value;
    const customer = document.getElementById('edit-m-customer').value;
    const model = document.getElementById('edit-m-name').value;
    const qty = parseInt(document.getElementById('edit-m-qty').value);
    const start = document.getElementById('edit-m-start').value;
    const end = document.getElementById('edit-m-end').value;
    const accessories = document.getElementById('edit-m-accessories').value;
    const sampleNote = document.getElementById('edit-m-sample-note').value;
    
    const sampleInput = document.getElementById('edit-m-sample-file');
    const normalInput = document.getElementById('edit-m-normal-files');
    
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Güncelleniyor...";
    btn.disabled = true;

    try {
        const order = mockData.orders.find(o => o.id === id);
        let extra = { fabric: null, drawings: [] };
        
        // Mevcut verileri yükle
        if (order.assigned_file && order.assigned_file.startsWith('{')) {
            extra = JSON.parse(order.assigned_file);
        } else if (order.assigned_file) {
            // Eski URL'i seri çizim olarak koru
            extra.drawings.push({ url: order.assigned_file, name: 'Eski Dosya', category: 'NormalDrawing' });
        }

        extra.accessories = accessories;
        extra.sample_note = sampleNote;

        // Yeni numune yükle
        if (sampleInput.files.length > 0) {
            const res = await uploadFileToSupabase(sampleInput.files[0]);
            if (res) {
                extra.drawings = extra.drawings.filter(f => f.category !== 'SampleDrawing');
                extra.drawings.push({ ...res, category: 'SampleDrawing' });
            }
        }
        
        // Yeni normal çizimleri ekle
        if (normalInput.files.length > 0) {
            for (let file of normalInput.files) {
                const res = await uploadFileToSupabase(file);
                if (res) extra.drawings.push({ ...res, category: 'NormalDrawing' });
            }
        }

        // Yeni ek görselleri ekle
        const extraImgInput = document.getElementById('edit-m-extra-images');
        if (extraImgInput && extraImgInput.files.length > 0) {
            for (let file of extraImgInput.files) {
                const res = await uploadFileToSupabase(file);
                if (res) extra.drawings.push({ ...res, category: 'Image' });
            }
        }

        const { error } = await supabaseClient.from('orders')
            .update({
                customer,
                model,
                qty,
                start_date: start,
                end_date: end,
                assigned_file: JSON.stringify(extra)
            })
            .eq('id', id);
            
        if(error) throw error;
        
        await addSystemLog(`Sipariş ve çizimler güncellendi: ${model} (${id})`);
        await loadData();
        renderPlanning();
        renderCuttingRecords();
        closeModal('edit-model-modal');
        alert("✅ Sipariş ve Çizimler başarıyla güncellendi.");
    } catch(err) {
        console.error(err);
        alert("Güncelleme sırasında bir hata oluştu.");
    } finally {
        btn.innerText = "Bilgileri Güncelle";
        btn.disabled = false;
    }
});

window.deleteModelImage = async function(orderId, url) {
    if(!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    
    try {
        const order = mockData.orders.find(o => String(o.id) === String(orderId));
        if(!order || !order.assigned_file) return;
        
        let extra = JSON.parse(order.assigned_file);
        if(extra.drawings) {
            extra.drawings = extra.drawings.filter(d => d.url !== url);
        }
        
        const { error } = await supabaseClient.from('orders')
            .update({ assigned_file: JSON.stringify(extra) })
            .eq('id', orderId);
            
        if(error) throw error;
        
        await loadData();
        window.openModelDetails(orderId); // Yenile
        alert("✅ Görsel silindi.");
    } catch(e) {
        console.error(e);
        alert("Görsel silinirken bir hata oluştu.");
    }
}

// Merkezi Tıklama Dinleyicisi (Event Delegation)
document.addEventListener('click', (e) => {
    // Detay Butonu Yakalayıcı
    const detailBtn = e.target.closest('[data-action="open-detail"]');
    if (detailBtn) {
        const id = detailBtn.getAttribute('data-id');
        console.log("Detay açılıyor:", id);
        if (window.openModelDetails) window.openModelDetails(id);
        return;
    }

    // Atölye Ata Butonu Yakalayıcı
    const assignBtn = e.target.closest('[data-action="open-assign"]');
    if (assignBtn) {
        const id = assignBtn.getAttribute('data-id');
        console.log("Atölye ata açılıyor:", id);
        if (window.openAssignFirmModal) window.openAssignFirmModal(id);
        return;
    }

    // Model/Sipariş Sil Butonu Yakalayıcı
    const deleteOrderBtn = e.target.closest('[data-action="delete-order"]');
    if (deleteOrderBtn) {
        const id = deleteOrderBtn.getAttribute('data-id');
        console.log("Model/Sipariş siliniyor:", id);
        if (confirm("Bu siparişi kalıcı olarak silmek ve iptal etmek istediğinizden emin misiniz?")) {
            if (window.deleteOrder) window.deleteOrder(id);
        }
        return;
    }

    // Kesime Gönder Butonu Yakalayıcı
    const cuttingBtn = e.target.closest('[data-action="send-to-cutting"]');
    if (cuttingBtn) {
        const id = cuttingBtn.getAttribute('data-id');
        console.log("Kesime gönderiliyor:", id);
        if (window.updateOrderStatus) window.updateOrderStatus(id, 'Kesimde');
        return;
    }
});

window.openModelDetails = window.openModelDetailsOriginal;

// Ensure all global helpers are available
window.openModal = function(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = 'flex';
}
window.closeModal = function(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = 'none';
}



// --- Global Modal Helpers ---
window.openAddPersonnelModal = () => openModal('add-personnel-modal');
window.openAddModelModal = () => openModal('add-model-modal');
window.openAddFirmModal = () => openModal('add-firm-modal');
window.deleteOrder = async function(id) {
    try {
        // 1. Delete associated lots first to avoid foreign key violations
        await supabaseClient.from('lots').delete().eq('order_id', id);
        
        // 2. Delete the order
        const { error } = await supabaseClient.from('orders').delete().eq('id', id);
        if (error) throw error;
        
        await addSystemLog(`Sipariş silindi: ${id}`);
        await loadData();
        renderPlanning();
        alert("✅ Sipariş başarıyla silindi ve iptal edildi.");
    } catch (err) {
        console.error(err);
        alert("Sipariş silinirken hata oluştu: " + err.message);
    }
}

window.openLotCreateModal = function(orderId) {
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if(!order) return;
    
    const idInput = document.getElementById('lot-order-id');
    const nameSpan = document.getElementById('lot-model-name');
    const qtySpan = document.getElementById('lot-order-total');
    
    if(idInput) idInput.value = orderId;
    if(nameSpan) nameSpan.innerText = order.model;
    if(qtySpan) qtySpan.innerText = order.qty;
    
    openModal('lot-create-modal');
}

window.openFabricInfoModal = function(orderId) {
    const input = document.getElementById('fabric-order-id');
    if(input) input.value = orderId;
    openModal('fabric-info-modal');
}

window.openCloseOrderModal = function(orderId) {
    const input = document.getElementById('close-order-id');
    if(input) input.value = orderId;
    openModal('close-order-modal');
}

// --- Work-Study Plan & Entry Logic ---

window.handleFinishTypeChange = function(select) {
    if (select.value === 'finish') {
        const row = select.closest('.plan-op-row');
        const cat = row.querySelector('.plan-op-category').value;
        const allRows = document.querySelectorAll('.plan-op-row');
        allRows.forEach(r => {
            if (r !== row) {
                const rCat = r.querySelector('.plan-op-category').value;
                const rType = r.querySelector('.plan-op-type');
                if (rCat === cat && rType.value === 'finish') {
                    rType.value = 'normal';
                }
            }
        });
    }
}

window.loadModelPlan = function() {
    const orderId = document.getElementById('plan-model-select').value;
    const list = document.getElementById('plan-operations-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!orderId) return;
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if (order && order.operations && order.operations.length > 0) {
        order.operations.forEach(op => {
            addOperationToPlan(op.name, op.target, op.category, op.type === 'finish');
        });
    } else {
        addOperationToPlan(); 
    }
}

// (Duplicate form listener removed to prevent conflicts with saveStudyPlan function)

// window.filterOperationsByPlan was moved to top

window.updatePerformance = function() {
    const orderId = document.getElementById('study-model').value;
    const opId = document.getElementById('study-operation').value;
    const actual = parseInt(document.getElementById('study-actual').value) || 0;
    const infoPanel = document.getElementById('study-info-panel');
    
    if (!orderId || !opId) {
        if (infoPanel) infoPanel.style.display = 'none';
        return;
    }
    
    const order = mockData.orders.find(o => String(o.id) === String(orderId));
    if (!order) return;
    
    const op = (order.operations || []).find(o => String(o.id) === String(opId));
    if (!op) return;
    
    const target = op.target || 0;
    document.getElementById('current-op-target').innerText = target + " Adet/Saat";
    
    if (target > 0) {
        const perf = Math.round((actual / target) * 100);
        const perfEl = document.getElementById('current-performance');
        perfEl.innerText = "%" + perf;
        
        if (perf >= 90) perfEl.style.color = '#10b981';
        else if (perf >= 70) perfEl.style.color = '#f59e0b';
        else perfEl.style.color = '#ef4444';
    } else {
        document.getElementById('current-performance').innerText = "%--";
    }
    
    if (infoPanel) infoPanel.style.display = 'block';
}

// Function renderWorkStudyRecords was moved to top for better accessibility

// window.refreshWorkStudyData was moved to top

// Global Submit Handler (Delegation for dynamic content)
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'add-op-to-plan-form') {
        e.preventDefault();
        submitAddOpToPlan();
        return;
    }
});

async function loadChatMessages() {
    try {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            if (error.code === 'PGRST116' || (error.message && error.message.includes('relation "chat_messages" does not exist'))) {
                mockData.chatMessages = null;
                renderChat();
                return;
            }
            throw error;
        }
        mockData.chatMessages = data || [];
        renderChat();
    } catch (e) {
        console.error("Chat mesajları yüklenirken hata:", e);
        mockData.chatMessages = null;
        renderChat();
    }
}
window.loadChatMessages = loadChatMessages;

function renderChat() {
    const body = document.getElementById('chat-body');
    if (!body) return;

    if (!currentUser) {
        body.innerHTML = '<p style="text-align:center; color:gray; padding:20px; font-size:0.85rem;">Giriş yapmanız gerekiyor.</p>';
        return;
    }

    if (mockData.chatMessages === null) {
        body.innerHTML = `
            <div style="padding:12px; font-size:0.8rem; line-height:1.4; background:#ffebeb; border:1px solid #ffc1c1; border-radius:8px; color:#c0392b;">
                <strong>Sohbet Tablosu Eksik!</strong><br>
                Sohbetin aktif olabilmesi için Supabase SQL ekranında aşağıdaki sorguyu çalıştırın:
                <pre style="background:rgba(0,0,0,0.05); padding:8px; border-radius:4px; margin-top:8px; overflow-x:auto; font-size:0.75rem; white-space:pre-wrap; word-break:break-all;">
create table chat_messages (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default now() not null,
  sender_name text not null,
  message text not null,
  firm_id bigint references firms(id) on delete cascade,
  is_from_atolye boolean default true
);
alter table chat_messages enable row level security;
create policy "Allow all" on chat_messages for all using (true) with check (true);
alter publication supabase_realtime add table chat_messages;
                </pre>
            </div>
        `;
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            const input = chatForm.querySelector('#chat-input');
            const button = chatForm.querySelector('button');
            if (input) input.disabled = true;
            if (button) button.disabled = true;
        }
        return;
    }

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        const input = chatForm.querySelector('#chat-input');
        const button = chatForm.querySelector('button');
        if (input) input.disabled = false;
        if (button) button.disabled = false;
    }

    const isHQ = currentUser.firmId === null;

    const selectorContainer = document.getElementById('chat-firm-selector-container');
    if (selectorContainer) {
        if (isHQ) {
            selectorContainer.style.display = 'block';
            const select = document.getElementById('chat-firm-select');
            if (select && select.children.length <= 1) {
                select.innerHTML = '<option value="">Bir Atölye Seçin...</option>' + 
                    mockData.firms.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
            }
        } else {
            selectorContainer.style.display = 'none';
        }
    }

    let activeFirmId = null;
    if (isHQ) {
        const select = document.getElementById('chat-firm-select');
        if (select && select.value) {
            activeFirmId = parseInt(select.value);
        }
    } else {
        activeFirmId = currentUser.firmId;
    }

    body.innerHTML = '';

    if (isHQ && !activeFirmId) {
        body.innerHTML = '<p style="text-align:center; color:gray; padding:20px; font-size:0.85rem;">Mesajlaşmaya başlamak için yukarıdan bir atölye seçin.</p>';
        return;
    }

    const messages = mockData.chatMessages.filter(m => String(m.firm_id) === String(activeFirmId));

    if (messages.length === 0) {
        body.innerHTML = '<p style="text-align:center; color:gray; padding:20px; font-size:0.85rem;">Henüz mesaj bulunmuyor. İlk mesajı siz yazın!</p>';
        return;
    }

    messages.forEach(m => {
        let isMyMessage = false;
        if (isHQ) {
            isMyMessage = !m.is_from_atolye;
        } else {
            isMyMessage = m.is_from_atolye;
        }

        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 0.85rem;
            line-height: 1.4;
            align-self: ${isMyMessage ? 'flex-end' : 'flex-start'};
            background: ${isMyMessage ? 'var(--primary)' : '#f1f1f1'};
            color: ${isMyMessage ? 'white' : '#333'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        `;

        const dateObj = new Date(m.created_at || Date.now());
        const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        bubble.innerHTML = `
            <div style="font-weight: 700; font-size: 0.7rem; margin-bottom: 2px; color: ${isMyMessage ? 'rgba(255,255,255,0.85)' : '#777'};">
                ${m.sender_name}
            </div>
            <div style="word-break: break-word;">${m.message}</div>
            <div style="font-size: 0.6rem; text-align: right; margin-top: 3px; color: ${isMyMessage ? 'rgba(255,255,255,0.7)' : '#999'};">
                ${timeStr}
            </div>
        `;
        body.appendChild(bubble);
    });

    setTimeout(() => {
        body.scrollTop = body.scrollHeight;
    }, 50);
}
window.renderChat = renderChat;

window.changeChatFirm = function() {
    renderChat();
};

window.sendChatMessage = async function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim() || !currentUser) return;

    const message = input.value.trim();
    const isHQ = currentUser.firmId === null;
    
    let activeFirmId = null;
    if (isHQ) {
        const select = document.getElementById('chat-firm-select');
        if (select && select.value) {
            activeFirmId = parseInt(select.value);
        }
    } else {
        activeFirmId = currentUser.firmId;
    }

    if (!activeFirmId) {
        alert("Lütfen mesaj göndermek için bir atölye seçin.");
        return;
    }

    input.value = '';

    try {
        const { error } = await supabaseClient.from('chat_messages').insert({
            sender_name: currentUser.username,
            message: message,
            firm_id: activeFirmId,
            is_from_atolye: !isHQ
        });

        if (error) throw error;
        
        await loadChatMessages();
    } catch (err) {
        console.error("Mesaj gönderilemedi:", err);
        alert("Mesaj gönderme hatası: " + err.message);
    }
};

window.clearChatMessages = async function() {
    if (!confirm("Tüm sohbet geçmişini silmek istediğinize emin misiniz?")) return;
    
    const isHQ = currentUser.firmId === null;
    let activeFirmId = null;
    if (isHQ) {
        const select = document.getElementById('chat-firm-select');
        if (select && select.value) {
            activeFirmId = parseInt(select.value);
        }
    } else {
        activeFirmId = currentUser.firmId;
    }

    if (!activeFirmId) return;

    try {
        const { error } = await supabaseClient
            .from('chat_messages')
            .delete()
            .eq('firm_id', activeFirmId);

        if (error) throw error;
        
        await loadChatMessages();
    } catch (err) {
        alert("Mesajlar silinemedi: " + err.message);
    }
};

function handleChatChange(payload) {
    if (payload && payload.eventType && payload.eventType.toUpperCase() === 'INSERT') {
        const msg = payload.new;
        if (msg && currentUser) {
            const isHQ = currentUser.firmId === null;
            const panel = document.getElementById('notification-panel');
            const isChatOpen = panel && window.getComputedStyle(panel).display !== 'none';
            
            let shouldIncrement = false;
            
            if (isHQ) {
                // HQ user: increment if message is from a workshop
                if (msg.is_from_atolye) {
                    const select = document.getElementById('chat-firm-select');
                    const activeFirmId = select ? select.value : '';
                    if (!isChatOpen || String(msg.firm_id) !== String(activeFirmId)) {
                        shouldIncrement = true;
                    }
                }
            } else {
                // Workshop user: increment if message is from HQ and belongs to their firm
                if (!msg.is_from_atolye && String(msg.firm_id) === String(currentUser.firmId)) {
                    if (!isChatOpen) {
                        shouldIncrement = true;
                    }
                }
            }
            
            if (shouldIncrement) {
                const badge = document.getElementById('notify-count');
                if (badge) {
                    let count = parseInt(badge.innerText) || 0;
                    count++;
                    badge.innerText = count;
                    badge.style.display = 'block';
                }
            }
        }
    }
    
    loadChatMessages();
}
window.handleChatChange = handleChatChange;

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered successfully:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
