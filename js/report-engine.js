// =============================================
//   NEV TEX PRO — RAPOR & DIŞA AKTARMA MOTORU
//   report-engine.js
// =============================================

// Aktif rapor verisi (Excel/PDF için saklanır)
let _reportCurrentData = { type: '', rows: [], headers: [], summary: [], title: '' };

const REPORT_TITLES = {
    'daily-efficiency':      '📊 Günlük Verimlilik Raporu',
    'personnel-performance': '👤 Personel Performans Raporu',
    'firm-production':       '🏭 Atölye Üretim Raporu',
    'cumulative-summary':    '📈 Kümülatif Özet Raporu'
};

// ---------------------------------------------
//  MODAL AÇMA
// ---------------------------------------------
window.openReportModal = function(type) {
    const now = new Date();
    const ago30 = new Date(now);
    ago30.setDate(ago30.getDate() - 30);
    const fmt = d => d.toISOString().split('T')[0];

    const elStart = document.getElementById('report-date-start');
    const elEnd   = document.getElementById('report-date-end');
    const elType  = document.getElementById('report-type-select');

    // Rol bazlı filtreleme: Atölyeci ise sadece kendi yetkili olduğu raporları görsün
    const isAtolye = window.currentUser && window.currentUser.firmId !== null;

    if (elType) {
        let optionsHtml = '';
        if (isAtolye) {
            optionsHtml += '<option value="daily-efficiency">Günlük Verimlilik</option>';
            optionsHtml += '<option value="personnel-performance">Personel Performansı</option>';
        } else {
            optionsHtml += '<option value="daily-efficiency">Günlük Verimlilik</option>';
            optionsHtml += '<option value="personnel-performance">Personel Performansı</option>';
            optionsHtml += '<option value="firm-production">Atölye Üretim Raporu</option>';
            optionsHtml += '<option value="cumulative-summary">Kümülatif Özet</option>';
        }
        elType.innerHTML = optionsHtml;
    }

    if (elStart) elStart.value = fmt(ago30);
    if (elEnd)   elEnd.value   = fmt(now);

    let defaultType = type || 'daily-efficiency';
    if (isAtolye && (defaultType === 'firm-production' || defaultType === 'cumulative-summary' || defaultType === 'model-production')) {
        defaultType = 'daily-efficiency';
    }
    if (elType) elType.value  = defaultType;

    // Model dropdown'u doldur
    _populateModelSelect();

    const modal = document.getElementById('report-modal');
    if (modal) modal.style.display = 'flex';

    // Kısa gecikme ile DOM hazır olduktan sonra raporu üret
    setTimeout(function() { onReportTypeChange(); }, 80);
};

// Rapor türü değişince: model filter her zaman görünür + rapor üret
window.onReportTypeChange = function() {
    generateReport();
};

// Model dropdown'ı doldur (orders + studies.model_name kaynaklı)
function _populateModelSelect() {
    var sel = document.getElementById('report-model-select');
    if (!sel) return;
    var orders  = (typeof mockData !== 'undefined' && mockData.orders)  ? mockData.orders  : [];
    var studies = (typeof mockData !== 'undefined' && mockData.studies) ? mockData.studies : [];

    // Rol bazlı model filtreleme: Atölyeci ise sadece kendi atölyesinin modellerini listele
    const isAtolye = window.currentUser && window.currentUser.firmId !== null;
    if (isAtolye) {
        var myFirmId = String(window.currentUser.firmId);
        orders = orders.filter(function(o) { return String(o.firmId) === myFirmId; });
        studies = studies.filter(function(s) { return String(s.firmId) === myFirmId; });
    }

    var prev = sel.value;
    sel.innerHTML = '<option value="">— Tüm Modeller —</option>';

    var seen = {};
    // 1) Aktif siparislerden
    orders.forEach(function(o) {
        var key = (o.customer ? o.customer + ' / ' : '') + (o.model || '-');
        if (!seen[key]) {
            seen[key] = true;
            var opt = document.createElement('option');
            opt.value = key;           // model_name formatıyla eşleşecek
            opt.dataset.orderId = String(o.id);
            opt.textContent = key;
            sel.appendChild(opt);
        }
    });
    // 2) Etüt kayıtlarındaki model_name değerlerinden
    studies.forEach(function(s) {
        var key = s.model_name || '';
        if (key && !seen[key]) {
            seen[key] = true;
            var opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            sel.appendChild(opt);
        }
    });
    if (prev) sel.value = prev;
}

// ---------------------------------------------
//  RAPOR ÜRET
// ---------------------------------------------
window.generateReport = function() {
    const type     = (document.getElementById('report-type-select') || {}).value || 'daily-efficiency';
    const startStr = (document.getElementById('report-date-start')  || {}).value || '';
    const endStr   = (document.getElementById('report-date-end')    || {}).value || '';

    const startDate = startStr ? new Date(startStr + 'T00:00:00') : null;
    const endDate   = endStr   ? new Date(endStr   + 'T23:59:59') : null;

    const titleEl    = document.getElementById('report-modal-title');
    const subtitleEl = document.getElementById('report-modal-subtitle');
    // Model filtresi
    var selModel = '';
    var selEl2 = document.getElementById('report-model-select');
    if (selEl2) selModel = selEl2.value || '';

    if (titleEl)    titleEl.textContent    = REPORT_TITLES[type] || 'Rapor';
    var subtitleParts = [(startStr || '---') + ' → ' + (endStr || '---') + ' aralığı'];
    if (selModel) subtitleParts.push('Model: ' + selModel);
    if (subtitleEl) subtitleEl.textContent = subtitleParts.join(' │ ');

    // mockData güvenli erişim
    if (typeof mockData === 'undefined') {
        var previewEl = document.getElementById('report-preview-container');
        if (previewEl) previewEl.innerHTML = '<div style="text-align:center;padding:40px;color:gray;">' +
            '<i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;margin-bottom:10px;display:block;"></i>' +
            '<p>Veriler yükleniyor, lütfen bekleyin…</p></div>';
        return;
    }

    let result;
    try {
        if (type === 'daily-efficiency')           result = _buildDailyEff(startDate, endDate);
        else if (type === 'personnel-performance') result = _buildPersonnelPerf(startDate, endDate);
        else if (type === 'model-production')      result = _buildModelProd(startDate, endDate);
        else if (type === 'firm-production')       result = _buildFirmProd(startDate, endDate);
        else                                       result = _buildCumulative(startDate, endDate);
    } catch(e) {
        console.error('Rapor üretme hatası:', e);
        result = { headers: [], rows: [], summary: [] };
    }

    _reportCurrentData = Object.assign({ type, title: REPORT_TITLES[type] }, result);
    _renderSummaryCards(result.summary);
    _renderTable(result.headers, result.rows);

    const btnExcel = document.getElementById('btn-export-excel');
    const btnPDF   = document.getElementById('btn-export-pdf');
    if (btnExcel) btnExcel.style.display = 'inline-flex';
    if (btnPDF)   btnPDF.style.display   = 'inline-flex';
};

// ---------------------------------------------
//  YARDIMCI: Tarih Aralığı Kontrolü
// ---------------------------------------------
function _inRange(dateVal, start, end) {
    if (!dateVal) return true;
    const d = new Date(dateVal);
    if (start && d < start) return false;
    if (end   && d > end)   return false;
    return true;
}

// Seçili model adını döndür
function _getSelectedModel() {
    var sel = document.getElementById('report-model-select');
    return sel ? (sel.value || '') : '';
}

// ---------------------------------------------
//  RAPOR 1: Günlük Verimlilik
// ---------------------------------------------
function _buildDailyEff(start, end) {
    var selModel = _getSelectedModel();
    var isAtolye = window.currentUser && window.currentUser.firmId !== null;
    var myFirmId = isAtolye ? String(window.currentUser.firmId) : null;

    var filtered = (mockData.studies || []).filter(function(s) {
        if (isAtolye && String(s.firmId) !== myFirmId) return false;
        if (!_inRange(s.time || s.created_at, start, end)) return false;
        if (selModel && (s.model_name || '') !== selModel) return false;
        return true;
    });

    var byDate = {};
    filtered.forEach(function(s) {
        var key = new Date(s.time || s.created_at).toLocaleDateString('tr-TR');
        if (!byDate[key]) byDate[key] = { total: 0, effSum: 0, count: 0 };
        var eff = s.cycle_time > 0 ? (s.efficiency / s.cycle_time) * 100 : 0;
        byDate[key].total   += s.efficiency || 0;
        byDate[key].effSum  += eff;
        byDate[key].count   += 1;
    });

    var rows = Object.entries(byDate).sort(function(a, b) {
        var ta = a[0].split('.').reverse().join('-');
        var tb = b[0].split('.').reverse().join('-');
        return new Date(ta) - new Date(tb);
    }).map(function(entry) {
        var date = entry[0], d = entry[1];
        return [date, d.count, d.total.toLocaleString('tr-TR'), '%' + (Math.round(d.effSum / d.count) || 0)];
    });

    var totalProd = filtered.reduce(function(a, s) { return a + (s.efficiency || 0); }, 0);
    var avgEff = filtered.length > 0
        ? Math.round(filtered.reduce(function(a, s) { return a + (s.cycle_time > 0 ? (s.efficiency / s.cycle_time) * 100 : 0); }, 0) / filtered.length)
        : 0;

    return {
        headers: ['Tarih', 'Kayıt Sayısı', 'Toplam Üretilen', 'Ort. Verimlilik'],
        rows: rows,
        summary: [
            { icon: '📋', value: filtered.length,                   label: 'Toplam Kayıt' },
            { icon: '👕', value: totalProd.toLocaleString('tr-TR'), label: selModel ? selModel + ' Üretilen' : 'Üretilen Adet' },
            { icon: '⚡', value: '%' + avgEff,                      label: 'Ort. Verimlilik' },
            { icon: '📅', value: Object.keys(byDate).length,        label: 'Gün Sayısı' }
        ]
    };
}

// ---------------------------------------------
//  RAPOR 2: Personel Performansı
// ---------------------------------------------
function _buildPersonnelPerf(start, end) {
    var selModel = _getSelectedModel();
    var isAtolye = window.currentUser && window.currentUser.firmId !== null;
    var myFirmId = isAtolye ? String(window.currentUser.firmId) : null;

    var filtered = (mockData.studies || []).filter(function(s) {
        if (isAtolye && String(s.firmId) !== myFirmId) return false;
        if (!_inRange(s.time || s.created_at, start, end)) return false;
        if (selModel && (s.model_name || '') !== selModel) return false;
        return true;
    });
    var byPerson = {};
    filtered.forEach(function(s) {
        // operation_name formatı: "PersonelAdı|||OperasyonAdı"
        var parts = (s.operation_name || '').split('|||');
        var name  = parts[0] || s.personnel_name || '-';
        if (!byPerson[name]) byPerson[name] = { total: 0, effSum: 0, count: 0, model: s.model_name || '-' };
        var eff = s.cycle_time > 0 ? (s.efficiency / s.cycle_time) * 100 : 0;
        byPerson[name].total   += s.efficiency || 0;
        byPerson[name].effSum  += eff;
        byPerson[name].count   += 1;
    });

    var rows = Object.entries(byPerson)
        .sort(function(a, b) { return (b[1].effSum / b[1].count) - (a[1].effSum / a[1].count); })
        .map(function(entry) {
            var name = entry[0], d = entry[1];
            return [name, d.model, d.count, d.total.toLocaleString('tr-TR'), '%' + (Math.round(d.effSum / d.count) || 0)];
        });

    var topPerson = rows.length > 0 ? rows[0][0] : '-';
    var avgAll    = rows.length > 0
        ? Math.round(rows.reduce(function(a, r) { return a + parseInt((r[4] || '0').replace('%', '')); }, 0) / rows.length)
        : 0;

    return {
        headers: ['Personel Adı', 'Model', 'Kayıt Sayısı', 'Toplam Üretilen', 'Ort. Performans'],
        rows: rows,
        summary: [
            { icon: '👥', value: Object.keys(byPerson).length, label: 'Aktif Personel' },
            { icon: '🏆', value: topPerson,                    label: 'En İyi Performans' },
            { icon: '⚡', value: '%' + avgAll,                 label: 'Genel Ort.' },
            { icon: '📋', value: filtered.length,              label: 'Toplam Kayıt' }
        ]
    };
}

// ---------------------------------------------
//  RAPOR 3: Model Üretim Raporu
// ---------------------------------------------
function _buildModelProd(start, end) {
    var orders = mockData.orders || [];
    var lots   = mockData.lots   || [];

    var isAtolye = window.currentUser && window.currentUser.firmId !== null;
    var myFirmId = isAtolye ? String(window.currentUser.firmId) : null;

    if (isAtolye) {
        orders = orders.filter(function(o) { return String(o.firmId) === myFirmId; });
        lots = lots.filter(function(l) { return String(l.firmId) === myFirmId; });
    }

    // Seçilen model filtresi
    var selModelId = '';
    var selEl = document.getElementById('report-model-select');
    if (selEl) selModelId = selEl.value || '';

    // Filtrele
    var filteredOrders = selModelId
        ? orders.filter(function(o) { return String(o.id) === selModelId; })
        : orders;

    var rows = filteredOrders.map(function(o) {
        var oLots    = lots.filter(function(l) { return String(l.order_id) === String(o.id); });
        var produced = oLots.reduce(function(a, l) { return a + (l.qty || l.quantity || 0); }, 0);
        var ordered  = o.qty || o.quantity || 0;
        var progress = ordered > 0 ? Math.round((produced / ordered) * 100) : 0;
        return [
            (o.customer || '-') + ' / ' + (o.model || '-'),
            ordered.toLocaleString('tr-TR'),
            produced.toLocaleString('tr-TR'),
            Math.max(0, ordered - produced).toLocaleString('tr-TR'),
            '%' + progress,
            o.end || o.end_date || '-'
        ];
    });

    var totalOrdered  = filteredOrders.reduce(function(a, o) { return a + (o.qty || o.quantity || 0); }, 0);
    var filteredLots  = selModelId ? lots.filter(function(l) {
        return filteredOrders.some(function(o) { return String(o.id) === String(l.order_id); });
    }) : lots;
    var totalProduced = filteredLots.reduce(function(a, l) { return a + (l.qty || l.quantity || 0); }, 0);
    var avgProgress   = rows.length > 0
        ? Math.round(rows.reduce(function(a, r) { return a + parseInt(r[4].replace('%', '')); }, 0) / rows.length)
        : 0;

    return {
        headers: ['Model / Müşteri', 'Sipariş Adedi', 'Üretilen', 'Kalan', 'İlerleme', 'Termin'],
        rows: rows,
        summary: [
            { icon: '🧵', value: filteredOrders.length,                    label: selModelId ? 'Seçili Model' : 'Aktif Model' },
            { icon: '📦', value: totalOrdered.toLocaleString('tr-TR'),   label: 'Toplam Sipariş' },
            { icon: '✅', value: totalProduced.toLocaleString('tr-TR'),  label: 'Toplam Üretilen' },
            { icon: '📊', value: '%' + avgProgress,                      label: 'Ort. Tamamlanma' }
        ]
    };
}

// ---------------------------------------------
//  RAPOR 4: Atölye Üretim Raporu
// ---------------------------------------------
function _buildFirmProd(start, end) {
    var firms  = mockData.firms   || [];
    var lots   = mockData.lots    || [];
    var orders = mockData.orders  || [];

    var isAtolye = window.currentUser && window.currentUser.firmId !== null;
    var myFirmId = isAtolye ? String(window.currentUser.firmId) : null;

    if (isAtolye) {
        firms = firms.filter(function(f) { return String(f.id) === myFirmId; });
        lots = lots.filter(function(l) { return String(l.firmId) === myFirmId; });
        orders = orders.filter(function(o) { return String(o.firmId) === myFirmId; });
    }

    var rows = firms.map(function(f) {
        var fLots    = lots.filter(function(l) { return String(l.firm_id || l.firmId) === String(f.id); });
        var fOrders  = orders.filter(function(o) { return String(o.firm_id || o.firmId) === String(f.id); });
        var produced = fLots.reduce(function(a, l) { return a + (l.qty || l.quantity || 0); }, 0);
        var modelNames = fOrders.slice(0, 3).map(function(o) { return o.model; }).join(', ') || '-';
        return [f.name || '-', fOrders.length, fLots.length, produced.toLocaleString('tr-TR'), modelNames];
    });

    var totalProd = lots.reduce(function(a, l) { return a + (l.qty || l.quantity || 0); }, 0);
    return {
        headers: ['Atölye Adı', 'Aktif Sipariş', 'Lot Sayısı', 'Toplam Üretilen', 'Aktif Modeller'],
        rows: rows,
        summary: [
            { icon: '🏭', value: firms.length,                         label: 'Toplam Atölye' },
            { icon: '📦', value: lots.length,                          label: 'Toplam Lot' },
            { icon: '👕', value: totalProd.toLocaleString('tr-TR'),    label: 'Toplam Üretilen' },
            { icon: '🗂️', value: orders.length,                        label: 'Aktif Sipariş' }
        ]
    };
}

// ---------------------------------------------
//  RAPOR 5: Kümülatif Özet
// ---------------------------------------------
function _buildCumulative(start, end) {
    var isAtolye = window.currentUser && window.currentUser.firmId !== null;
    var myFirmId = isAtolye ? String(window.currentUser.firmId) : null;

    var studies   = (mockData.studies   || []).filter(function(s) { 
        if (isAtolye && String(s.firmId) !== myFirmId) return false;
        return _inRange(s.time || s.created_at, start, end); 
    });
    var lots      = mockData.lots      || [];
    var orders    = mockData.orders    || [];
    var personnel = mockData.personnel || [];
    var firms     = mockData.firms     || [];

    if (isAtolye) {
        lots = lots.filter(function(l) { return String(l.firmId) === myFirmId; });
        orders = orders.filter(function(o) { return String(o.firmId) === myFirmId; });
        personnel = personnel.filter(function(p) { return String(p.firmId) === myFirmId; });
        firms = firms.filter(function(f) { return String(f.id) === myFirmId; });
    }

    var totalProd = lots.reduce(function(a, l) { return a + (l.qty || l.quantity || 0); }, 0);
    var avgEff    = studies.length > 0
        ? Math.round(studies.reduce(function(a, s) { return a + (s.cycle_time > 0 ? (s.efficiency / s.cycle_time) * 100 : 0); }, 0) / studies.length)
        : 0;

    var byOp = {};
    studies.forEach(function(s) {
        var op = s.operation || 'Bilinmiyor';
        if (!byOp[op]) byOp[op] = { count: 0, effSum: 0 };
        byOp[op].count  += 1;
        byOp[op].effSum += s.cycle_time > 0 ? (s.efficiency / s.cycle_time) * 100 : 0;
    });

    var rows = Object.entries(byOp)
        .sort(function(a, b) { return b[1].count - a[1].count; })
        .map(function(entry) {
            var op = entry[0], d = entry[1];
            return [op, d.count, '%' + (Math.round(d.effSum / d.count) || 0)];
        });

    return {
        headers: ['Operasyon', 'Kayıt Sayısı', 'Ort. Verimlilik'],
        rows: rows,
        summary: [
            { icon: '📋', value: studies.length,                       label: 'Etüt Kaydı' },
            { icon: '👕', value: totalProd.toLocaleString('tr-TR'),    label: 'Toplam Üretilen' },
            { icon: '⚡', value: '%' + avgEff,                         label: 'Genel Verimlilik' },
            { icon: '👥', value: personnel.length,                     label: 'Personel' },
            { icon: '🏭', value: firms.length,                         label: 'Atölye' },
            { icon: '🧵', value: orders.length,                        label: 'Aktif Sipariş' }
        ]
    };
}

// ---------------------------------------------
//  UI: Özet Kartlar
// ---------------------------------------------
function _renderSummaryCards(summary) {
    var container = document.getElementById('report-summary-cards');
    if (!container) return;
    container.innerHTML = (summary || []).map(function(s) {
        return '<div class="report-stat-card">' +
            '<span class="rsc-icon">' + s.icon + '</span>' +
            '<span class="rsc-value">' + s.value + '</span>' +
            '<span class="rsc-label">' + s.label + '</span>' +
            '</div>';
    }).join('');
}

// ---------------------------------------------
//  UI: Önizleme Tablosu
// ---------------------------------------------
function _renderTable(headers, rows) {
    var container = document.getElementById('report-preview-container');
    if (!container) return;

    if (!rows || rows.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:gray;">' +
            '<i class="fa-solid fa-inbox" style="font-size:2.5rem;margin-bottom:10px;display:block;color:#ddd;"></i>' +
            '<p>Seçilen tarih aralığında kayıt bulunamadı</p></div>';
        return;
    }

    var thHtml = (headers || []).map(function(h) { return '<th>' + h + '</th>'; }).join('');
    var trHtml = (rows || []).map(function(row) {
        var cells = row.map(function(cell) {
            var cls = '';
            if (typeof cell === 'string' && cell.charAt(0) === '%') {
                var n = parseInt(cell.replace('%', ''));
                cls = n >= 90 ? 'perf-high' : n >= 70 ? 'perf-mid' : 'perf-low';
            }
            return '<td class="' + cls + '">' + cell + '</td>';
        }).join('');
        return '<tr>' + cells + '</tr>';
    }).join('');

    container.innerHTML = '<table class="report-preview-table">' +
        '<thead><tr>' + thHtml + '</tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
        '</table>';
}

// ---------------------------------------------
//  EXCEL EXPORT
// ---------------------------------------------
window.exportReportToExcel = function() {
    if (!_reportCurrentData.rows || _reportCurrentData.rows.length === 0) {
        alert('Önce raporu oluşturun!'); return;
    }
    if (typeof XLSX === 'undefined') {
        alert('Excel kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.'); return;
    }

    var wb = XLSX.utils.book_new();
    var wsData = [_reportCurrentData.headers].concat(_reportCurrentData.rows);
    var ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = (_reportCurrentData.headers || []).map(function() { return { wch: 22 }; });
    XLSX.utils.book_append_sheet(wb, ws, 'Rapor');

    if (_reportCurrentData.summary && _reportCurrentData.summary.length > 0) {
        var sumData = [['Gösterge', 'Değer']].concat(
            _reportCurrentData.summary.map(function(s) { return [s.label, String(s.value)]; })
        );
        var wsSummary = XLSX.utils.aoa_to_sheet(sumData);
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');
    }

    var dateStr  = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    var typeName = (_reportCurrentData.type || 'rapor').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, 'NevTex_' + typeName + '_' + dateStr + '.xlsx');
};

// ---------------------------------------------
//  PDF / PRINT EXPORT
// ---------------------------------------------
window.exportReportToPDF = function() {
    if (!_reportCurrentData.rows || _reportCurrentData.rows.length === 0) {
        alert('Önce raporu oluşturun!'); return;
    }

    var startVal = (document.getElementById('report-date-start') || {}).value || '---';
    var endVal   = (document.getElementById('report-date-end')   || {}).value || '---';
    var now      = new Date().toLocaleString('tr-TR');
    var title    = _reportCurrentData.title || 'Rapor';

    var summaryHtml = (_reportCurrentData.summary || []).map(function(s) {
        return '<div class="report-print-stat"><span class="val">' + s.icon + ' ' + s.value + '</span><span class="lbl">' + s.label + '</span></div>';
    }).join('');

    var thHtml = (_reportCurrentData.headers || []).map(function(h) {
        return '<th style="background:#2c3e50;color:white;padding:10px 12px;text-align:left;font-size:0.78rem;">' + h + '</th>';
    }).join('');

    var trHtml = (_reportCurrentData.rows || []).map(function(row) {
        var cells = row.map(function(cell) {
            var cls = '';
            if (typeof cell === 'string' && cell.charAt(0) === '%') {
                var n = parseInt(cell.replace('%', ''));
                cls = n >= 90 ? 'perf-high' : n >= 70 ? 'perf-mid' : 'perf-low';
            }
            return '<td class="' + cls + '" style="padding:9px 12px;border-bottom:1px solid #f0f0f0;">' + cell + '</td>';
        }).join('');
        return '<tr>' + cells + '</tr>';
    }).join('');

    var frame = document.getElementById('report-print-frame');
    if (!frame) {
        frame = document.createElement('div');
        frame.id = 'report-print-frame';
        frame.style.display = 'none';
        document.body.appendChild(frame);
    }

    frame.innerHTML =
        '<div class="report-print-header">' +
            '<div class="brand-name"><i class="fa-solid fa-shirt" style="color:#1F51FF;margin-right:8px;"></i>Nev <span>Tex</span> Pro</div>' +
            '<div class="print-date">Oluşturulma: ' + now + '</div>' +
        '</div>' +
        '<div class="report-print-title">' + title + '</div>' +
        '<div style="font-size:0.8rem;color:gray;margin-bottom:14px;">📅 Tarih Aralığı: ' + startVal + ' → ' + endVal + '</div>' +
        '<div class="report-print-stats">' + summaryHtml + '</div>' +
        '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:10px;">' +
            '<thead><tr>' + thHtml + '</tr></thead>' +
            '<tbody>' + trHtml + '</tbody>' +
        '</table>' +
        '<div style="margin-top:30px;font-size:0.7rem;color:#aaa;text-align:right;border-top:1px solid #eee;padding-top:10px;">' +
            'Nev Tex Pro — Tekstil Etüt ve Üretim Takip Sistemi' +
        '</div>';

    window.print();
};
