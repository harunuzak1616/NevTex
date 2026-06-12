# Tekstil Etüt ve Üretim Takip Sistemi Kaynak Kodları

## index.html
``html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tekstil Etüt ve Üretim Takip</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Login Ekranı -->
    <div id="login-overlay">
        <div class="login-box glass">
            <i class="fa-solid fa-shirt"></i>
            <h2>TexTrack Pro</h2>
            <p style="margin-bottom:20px; color:#666;">Sisteme giriş yapın</p>
            <form id="login-form">
                <div class="form-group" style="text-align:left;">
                    <label>Kullanıcı Adı</label>
                    <input type="text" id="login-user" required>
                </div>
                <div class="form-group" style="text-align:left;">
                    <label>Şifre</label>
                    <input type="password" id="login-pass" required>
                </div>
                <div class="form-group" style="text-align:left; display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" id="login-remember" style="width:auto;">
                    <label for="login-remember" style="margin-bottom:0; cursor:pointer;">Beni Hatırla</label>
                </div>
                <button type="submit" class="btn-primary w-100 mt-2">Giriş Yap</button>
            </form>
        </div>
    </div>

    <div class="app-container" id="main-app" style="display:none;">
        <!-- Sidebar Navigation -->
        <aside class="sidebar glass">
            <div class="logo">
                <i class="fa-solid fa-shirt"></i>
                <h2>TexTrack Pro</h2>
            </div>
            <nav class="nav-menu">
                <button class="nav-item active" data-target="overview">
                    <i class="fa-solid fa-chart-pie"></i> Genel Bakış
                </button>
                <button class="nav-item" data-target="personnel">
                    <i class="fa-solid fa-users"></i> Personel
                </button>
                <button class="nav-item" data-target="work-study">
                    <i class="fa-solid fa-stopwatch"></i> Etüt Girişi
                </button>
                <button class="nav-item" data-target="loading">
                    <i class="fa-solid fa-truck-fast"></i> Yükleme Tahmini
                </button>
                <button class="nav-item" data-target="planning">
                    <i class="fa-solid fa-calendar-days"></i> Planlama & Kesim
                </button>
                <button class="nav-item" data-target="barcode">
                    <i class="fa-solid fa-barcode"></i> Barkod & Sevkiyat
                </button>
                <button class="nav-item" data-target="settings">
                    <i class="fa-solid fa-cog"></i> Ayarlar
                </button>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            <header class="top-header glass">
                <div class="header-title">
                    <h1 id="page-title">Genel Bakış</h1>
                </div>
                <div class="user-profile">
                    <div style="text-align:right; margin-right:15px;">
                        <div id="header-username" style="font-weight:600; font-size:0.9rem;">Misafir</div>
                        <div id="header-role" style="font-size:0.8rem; color:var(--primary);">Rol Bekleniyor</div>
                    </div>
                    <div class="avatar"><i class="fa-solid fa-user-tie"></i></div>
                    <button class="btn-danger" style="margin-left:15px; padding:8px 12px;" onclick="logout()"><i class="fa-solid fa-sign-out-alt"></i> Çıkış</button>
                </div>
            </header>

            <div class="content-wrapper">
                
                <!-- SECTION: Genel Bakış -->
                <section id="overview" class="page-section active">
                    <div class="stats-grid">
                        <div class="stat-card glass">
                            <div class="stat-icon"><i class="fa-solid fa-shirt"></i></div>
                            <div class="stat-info">
                                <h3>Günlük Üretim</h3>
                                <p class="stat-value">1,245 <small>Adet</small></p>
                            </div>
                        </div>
                        <div class="stat-card glass">
                            <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                            <div class="stat-info">
                                <h3>Aktif Personel</h3>
                                <p class="stat-value">86</p>
                            </div>
                        </div>
                        <div class="stat-card glass">
                            <div class="stat-icon"><i class="fa-solid fa-bolt"></i></div>
                            <div class="stat-info">
                                <h3>Ortalama Verimlilik</h3>
                                <p class="stat-value">%82</p>
                            </div>
                        </div>
                    </div>

                    <div class="charts-container">
                        <div class="chart-card glass">
                            <h3>Saatlik Üretim Grafiği</h3>
                            <div class="canvas-container">
                                <canvas id="hourlyChart"></canvas>
                            </div>
                        </div>
                        <div class="chart-card glass">
                            <h3>Departman Verimliliği</h3>
                            <div class="progress-bars" id="dept-efficiency">
                                <!-- JS ile doldurulacak -->
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION: Personel -->
                <section id="personnel" class="page-section">
                    <div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <h2>Personel Listesi</h2>
                        <button class="btn-primary" onclick="openAddPersonnelModal()"><i class="fa-solid fa-plus"></i> Yeni Ekle</button>
                    </div>
                    <div class="personnel-grid" id="personnel-list">
                        <!-- JS ile doldurulacak -->
                    </div>
                </section>

                <!-- SECTION: Etüt Girişi -->
                <section id="work-study" class="page-section">
                    <div class="form-container glass">
                        <h2>Yeni Etüt Kaydı</h2>
                        <form id="study-form">
                            <div class="form-group">
                                <label>Model / Sipariş</label>
                                <select id="study-model" required></select>
                            </div>
                            <div class="form-group">
                                <label>Personel</label>
                                <select id="study-personnel" required></select>
                            </div>
                            <div class="form-group">
                                <label>Saat Dilimi</label>
                                <select required>
                                    <option>08:00 - 09:00</option>
                                    <option>09:00 - 10:00</option>
                                    <option>10:00 - 11:00</option>
                                    <option>11:00 - 12:00</option>
                                    <option>13:00 - 14:00</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Operasyon</label>
                                <select id="study-operation" required>
                                    <option value="">Önce Model Seçin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Saatlik Hedef</label>
                                <div id="study-dynamic-target" style="padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px; font-weight: 600; color: var(--primary);">--</div>
                                <input type="hidden" id="study-target-hidden" value="0">
                            </div>
                            <div class="form-group">
                                <label>Gerçekleşen Adet</label>
                                <input type="number" id="study-actual" min="0" required>
                            </div>
                            <button type="submit" class="btn-primary">Kaydet</button>
                        </form>
                    </div>
                    
                    <div class="table-container glass mt-2">
                        <h3>Son Etüt Kayıtları</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Personel</th>
                                    <th>Model</th>
                                    <th>Departman</th>
                                    <th>Saat</th>
                                    <th>Adet</th>
                                    <th>Verimlilik Durumu</th>
                                </tr>
                            </thead>
                            <tbody id="study-records">
                                <!-- JS ile doldurulacak -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- SECTION: Yükleme Tahmini -->
                <section id="loading" class="page-section">
                    <div class="split-layout">
                        <div class="form-container glass flex-1">
                            <h2>Sipariş Tahmin Hesaplayıcı</h2>
                            <form id="loading-form">
                                <div class="form-group">
                                    <label>Sipariş Adedi</label>
                                    <input type="number" id="order-qty" value="5000">
                                </div>
                                <div class="form-group">
                                    <label>Günlük Hedef Kapasite (Adet)</label>
                                    <input type="number" id="daily-cap" value="800">
                                </div>
                                <div class="form-group">
                                    <label>Fazla Mesai Çarpanı (%)</label>
                                    <input type="number" id="overtime" value="0" max="50">
                                </div>
                                <button type="button" class="btn-primary w-100" onclick="calculateLoading()">Hesapla</button>
                            </form>
                        </div>
                        <div class="results-container glass flex-2">
                            <h2>Tahmin Sonucu</h2>
                            <div id="loading-result" class="estimation-result">
                                <div class="result-highlight">
                                    <span class="days" id="est-days">--</span> Gün
                                </div>
                                <p>Siparişin tamamlanması için öngörülen süre.</p>
                                <div class="progress-track mt-2">
                                    <div class="progress-fill" id="est-progress" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION: Planlama & Kesimhane -->
                <section id="planning" class="page-section">
                    <div class="tabs-sub">
                        <button class="sub-tab active" data-subtarget="plan-gantt">Planlama</button>
                        <button class="sub-tab" data-subtarget="cut-room">Kesimhane</button>
                    </div>
                    
                    <div id="plan-gantt" class="sub-section active glass mt-2 p-2">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="margin:0;">Sipariş Zaman Çizelgesi</h3>
                            <button class="btn-primary" onclick="openAddModelModal()"><i class="fa-solid fa-plus"></i> Yeni Model Ekle</button>
                        </div>
                        <table class="data-table gantt-table">
                            <thead>
                                <tr>
                                    <th>Model/Müşteri</th>
                                    <th>Adet</th>
                                    <th>Başlangıç</th>
                                    <th>Teslim</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody id="planning-records">
                                <!-- JS ile doldurulacak -->
                            </tbody>
                        </table>
                    </div>

                    <div id="cut-room" class="sub-section glass mt-2 p-2" style="display:none;">
                        <h3>Kesim Emirleri</h3>
                        <div class="personnel-grid" id="cutting-records">
                            <!-- JS ile doldurulacak -->
                        </div>
                    </div>
                </section>

                <!-- SECTION: Barkod & Sevkiyat -->
                <section id="barcode" class="page-section">
                    <div class="tabs-sub">
                        <button class="sub-tab active" data-subtarget="lot-track">Lot Takibi</button>
                        <button class="sub-tab" data-subtarget="barcode-gen">Barkod Üret</button>
                        <button class="sub-tab" data-subtarget="shipment-sec">Sevkiyat</button>
                    </div>
                    
                    <!-- Lot Takibi -->
                    <div id="lot-track" class="sub-section active glass mt-2 p-2">
                        <h3>Aktif Lotlar</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Lot No</th>
                                    <th>Model/Renk</th>
                                    <th>Adet</th>
                                    <th>Aşama</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody id="lot-records">
                                <!-- JS ile doldurulacak -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Barkod Üret -->
                    <div id="barcode-gen" class="sub-section glass mt-2 p-2" style="display:none;">
                        <h3>Barkod Simülasyonu</h3>
                        <div class="barcode-preview">
                            <div class="barcode-box">
                                <img src="https://barcode.tec-it.com/barcode.ashx?data=LOT20230501A&code=Code128" alt="Barcode" id="barcode-img">
                                <p id="barcode-text">LOT20230501A</p>
                            </div>
                            <div class="barcode-controls mt-2">
                                <input type="text" id="custom-lot" value="LOT20230501A">
                                <button class="btn-primary" onclick="generateBarcode()">Oluştur</button>
                            </div>
                        </div>
                    </div>

                    <!-- Sevkiyat -->
                    <div id="shipment-sec" class="sub-section glass mt-2 p-2" style="display:none;">
                        <h3>Sevkiyat Planı</h3>
                        <div class="form-container">
                            <div class="form-group">
                                <label>Müşteri / Hedef</label>
                                <input type="text" value="ZARA - Merkez Depo">
                            </div>
                            <div class="form-group">
                                <label>Lot Barkodları (Virgülle ayırın)</label>
                                <input type="text" placeholder="Örn: LOT123, LOT124">
                            </div>
                            <button class="btn-primary mt-2">İrsaliye Oluştur</button>
                        </div>
                    </div>
                </section>

                <!-- SECTION: Ayarlar -->
                <section id="settings" class="page-section">
                    <div class="tabs-sub mb-2">
                        <button class="sub-tab active" data-subtarget="set-op">Operasyon Ayarları</button>
                        <button class="sub-tab" data-subtarget="set-users">Kullanıcı Ayarları</button>
                        <button class="sub-tab" data-subtarget="set-sound">Ses Ayarları</button>
                        <button class="sub-tab" data-subtarget="set-lang">Dil Seçenekleri</button>
                    </div>
                    
                    <!-- Operasyon Ayarları -->
                    <div id="set-op" class="sub-section active glass mt-2 p-2">
                        <div class="split-layout">
                            <div class="form-container flex-1" style="box-shadow: none; padding-left: 0;">
                                <h2>Yeni Operasyon Tanımla</h2>
                                <form id="settings-op-form">
                                    <div class="form-group mt-2">
                                        <label>Operasyon Adı</label>
                                        <input type="text" id="new-op-name" placeholder="Örn: Overlok Yan Çatım" required>
                                    </div>
                                    <button type="submit" class="btn-primary w-100">Ekle</button>
                                </form>
                            </div>
                            <div class="table-container flex-2" style="box-shadow: none;">
                                <h3>Kayıtlı Operasyonlar</h3>
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Operasyon Adı</th>
                                            <th style="width:100px;">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody id="settings-op-list">
                                        <!-- JS ile doldurulacak -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Kullanıcı Ayarları -->
                    <div id="set-users" class="sub-section glass mt-2 p-2" style="display:none;">
                        <div class="split-layout">
                            <div class="form-container flex-1" style="box-shadow: none; padding-left: 0;">
                                <h2>Yeni Kullanıcı Ekle</h2>
                                <form id="settings-user-form">
                                    <div class="form-group mt-2">
                                        <label>Kullanıcı Adı</label>
                                        <input type="text" id="new-u-name" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Şifre</label>
                                        <input type="text" id="new-u-pass" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Kullanıcı Rolü / Ünvanı</label>
                                        <input type="text" id="new-u-role" placeholder="Örn: Kesim Şefi" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Erişim Yetkileri (Görebileceği Sayfalar)</label>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px; font-size: 0.9rem;">
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="overview" checked> Genel Bakış</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="personnel"> Personel</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="work-study"> Etüt Girişi</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="loading"> Yükleme Tahmini</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="planning"> Planlama</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="barcode"> Barkod</label>
                                            <label style="display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="perm-chk" value="settings"> Ayarlar</label>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn-primary w-100">Kullanıcı Ekle</button>
                                </form>
                            </div>
                            <div class="table-container flex-2" style="box-shadow: none;">
                                <h3>Kayıtlı Kullanıcılar</h3>
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Kullanıcı Adı</th>
                                            <th>Rol</th>
                                            <th>Yetkiler</th>
                                            <th style="width:50px;">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody id="settings-user-list">
                                        <!-- JS ile doldurulacak -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ses Ayarları -->
                    <div id="set-sound" class="sub-section glass mt-2 p-2" style="display:none;">
                        <h3>Sistem Ses Ayarları</h3>
                        <div class="form-group mt-2" style="max-width: 300px;">
                            <label>Bildirim Sesi</label>
                            <select>
                                <option>Açık</option>
                                <option>Sadece Titreşim</option>
                                <option>Kapalı</option>
                            </select>
                        </div>
                        <div class="form-group" style="max-width: 300px;">
                            <label>Uyarı Zili (Hata Durumu)</label>
                            <select>
                                <option>Açık</option>
                                <option>Kapalı</option>
                            </select>
                        </div>
                        <button class="btn-primary mt-2">Ayarları Kaydet</button>
                    </div>

                    <!-- Dil Ayarları -->
                    <div id="set-lang" class="sub-section glass mt-2 p-2" style="display:none;">
                        <h3>Sistem Dili</h3>
                        <div class="form-group mt-2" style="max-width: 300px;">
                            <label>Varsayılan Dil</label>
                            <select id="lang-select">
                                <option value="tr">Türkçe (TR)</option>
                                <option value="en">English (EN)</option>
                            </select>
                        </div>
                        <button class="btn-primary mt-2" onclick="changeLanguage()">Dili Değiştir</button>
                    </div>

                </section>

            </div>
        </main>
    </div>

    <!-- Modals -->
    <!-- Personel Ekleme Modalı -->
    <div id="add-personnel-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content glass">
            <div class="modal-header">
                <h2>Yeni Personel Ekle</h2>
                <button class="close-modal" onclick="closeModal('add-personnel-modal')"><i class="fa-solid fa-times"></i></button>
            </div>
            <form id="add-personnel-form">
                <div class="form-group">
                    <label>Ad Soyad</label>
                    <input type="text" id="new-p-name" required>
                </div>
                <div class="form-group">
                    <label>Departman</label>
                    <select id="new-p-dept" required>
                        <option value="Kesim">Kesim</option>
                        <option value="Dikim">Dikim</option>
                        <option value="Ütü/Paket">Ütü/Paket</option>
                        <option value="Kalite">Kalite</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Vardiya</label>
                    <select id="new-p-shift" required>
                        <option value="08:00 - 16:00">08:00 - 16:00</option>
                        <option value="16:00 - 00:00">16:00 - 00:00</option>
                        <option value="00:00 - 08:00">00:00 - 08:00</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary w-100 mt-2">Kaydet</button>
            </form>
        </div>
    </div>

    <!-- Personel Detay ve Geçmiş Modalı -->
    <div id="personnel-detail-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content glass" style="max-width: 800px; width: 90%;">
            <div class="modal-header">
                <h2 id="detail-modal-title">Personel Detayı</h2>
                <button class="close-modal" onclick="closeModal('personnel-detail-modal')"><i class="fa-solid fa-times"></i></button>
            </div>
            
            <div class="split-layout mt-2" style="flex-direction: column;">
                <!-- Başarı Yüzdesi Grafiği -->
                <div style="height: 200px; margin-bottom: 20px;">
                    <canvas id="personnelChart"></canvas>
                </div>
                
                <!-- Geçmiş Operasyonlar Tablosu -->
                <div style="overflow-y: auto; max-height: 250px;">
                    <h3>Etüt Geçmişi</h3>
                    <table class="data-table mt-2">
                        <thead>
                            <tr>
                                <th>Zaman</th>
                                <th>Model</th>
                                <th>Adet</th>
                                <th>Hedef</th>
                                <th>Verimlilik</th>
                            </tr>
                        </thead>
                        <tbody id="history-records">
                            <!-- JS ile doldurulacak -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Yeni Model (Sipariş) Ekleme Modalı -->
    <div id="add-model-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content glass">
            <div class="modal-header">
                <h2>Yeni Model Siparişi Ekle</h2>
                <button class="close-modal" onclick="closeModal('add-model-modal')"><i class="fa-solid fa-times"></i></button>
            </div>
            <form id="add-model-form">
                <div class="form-group">
                    <label>Müşteri / Marka</label>
                    <input type="text" id="new-m-customer" required>
                </div>
                <div class="form-group">
                    <label>Model Adı</label>
                    <input type="text" id="new-m-name" placeholder="Örn: Kadın Elbise" required>
                </div>
                <div class="form-group">
                    <label>Sipariş Adedi</label>
                    <input type="number" id="new-m-qty" required>
                </div>
                <div class="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="date" id="new-m-start" required>
                </div>
                <div class="form-group">
                    <label>Teslim Tarihi</label>
                    <input type="date" id="new-m-end" required>
                </div>
                <button type="submit" class="btn-primary w-100 mt-2">Kaydet</button>
            </form>
        </div>
    </div>

    <!-- Model Düzenleme Modalı -->
    <div id="edit-model-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content glass" style="max-width: 900px; width: 95%;">
            <div class="modal-header">
                <h2 id="edit-modal-title">Model Düzenle</h2>
                <button class="close-modal" onclick="closeModal('edit-model-modal')"><i class="fa-solid fa-times"></i></button>
            </div>
            
            <input type="hidden" id="edit-model-id">

            <div class="tabs-sub mt-2" style="margin-bottom: 20px;">
                <button class="sub-tab edit-sub-tab active" data-subtarget="edit-kesim">Kesim</button>
                <button class="sub-tab edit-sub-tab" data-subtarget="edit-dikim">Dikim</button>
                <button class="sub-tab edit-sub-tab" data-subtarget="edit-aksesuar">Aksesuar & Malzeme</button>
                <button class="sub-tab edit-sub-tab" data-subtarget="edit-numune">Numune</button>
            </div>
            
            <!-- Kesim Sekmesi -->
            <div id="edit-kesim" class="edit-sub-section active p-2" style="background: rgba(255,255,255,0.3); border-radius: 12px;">
                <h3>Kesim Hedefleri</h3>
                <div class="form-group mt-2" style="max-width: 300px;">
                    <label>Saatlik Atılması Gereken Kat Hedefi</label>
                    <input type="number" id="edit-cutting-target" class="w-100" min="0">
                </div>
                <button class="btn-primary mt-2" onclick="saveCuttingTarget()">Hedefi Kaydet</button>
            </div>
            
            <!-- Dikim Sekmesi -->
            <div id="edit-dikim" class="edit-sub-section p-2" style="display:none; background: rgba(255,255,255,0.3); border-radius: 12px;">
                <div class="split-layout">
                    <div class="flex-1 form-container" style="padding:0 15px 0 0; border-right:1px solid var(--glass-border);">
                        <h3>Operasyon Ekle</h3>
                        <form id="add-model-op-form">
                            <div class="form-group mt-2">
                                <label>Operasyon Seçin</label>
                                <select id="model-op-select" required></select>
                            </div>
                            <div class="form-group">
                                <label>Sıra No (Örn: 1, 2, 3)</label>
                                <input type="number" id="model-op-order" min="1" required>
                            </div>
                            <div class="form-group">
                                <label>Saatlik Hedef</label>
                                <input type="number" id="model-op-target" min="1" required>
                            </div>
                            <button type="submit" class="btn-primary w-100">Operasyon Ekle</button>
                        </form>
                    </div>
                    <div class="flex-2" style="padding-left:15px; overflow-y:auto; max-height:400px;">
                        <h3>Modele Eklenen Operasyonlar</h3>
                        <table class="data-table mt-2">
                            <thead>
                                <tr>
                                    <th>Sıra No</th>
                                    <th>Operasyon</th>
                                    <th>Saatlik Hedef</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody id="model-operations-list">
                                <!-- JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Aksesuar & Numune (Yer Tutucu) -->
            <div id="edit-aksesuar" class="edit-sub-section p-2" style="display:none; background: rgba(255,255,255,0.3); border-radius: 12px;">
                <h3>Aksesuar ve Malzeme İhtiyaçları</h3>
                <p class="mt-2">Bu bölüm modele ait iplik, düğme, fermuar gibi yan malzemelerin takibi için ayrılmıştır.</p>
            </div>
            <div id="edit-numune" class="edit-sub-section p-2" style="display:none; background: rgba(255,255,255,0.3); border-radius: 12px;">
                <h3>Numune Durumu</h3>
                <p class="mt-2">Bu bölüm modelin ön üretim / numune onay sürecinin takibi için ayrılmıştır.</p>
            </div>
            
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/app.js"></script>
</body>
</html>

``

## css/style.css
``css
:root {
    /* Color Palette (Orange & White Dominant) */
    --primary: #ff6b00;
    --primary-light: #ff983f;
    --primary-dark: #cc5600;
    --secondary: #2c3e50;
    --bg-main: #f4f7f6;
    --bg-white: #ffffff;
    --text-main: #2b2b2b;
    --text-muted: #6b7280;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;

    /* Glassmorphism Variables */
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(255, 255, 255, 0.4);
    --glass-shadow: 0 8px 32px 0 rgba(255, 107, 0, 0.05);
    
    /* Layout */
    --sidebar-width: 250px;
    --header-height: 70px;
    --radius: 16px;
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}

body {
    background: var(--bg-main);
    color: var(--text-main);
    /* Subtle gradient background */
    background: linear-gradient(135deg, #fff3e0 0%, #f4f7f6 100%);
    min-height: 100vh;
    overflow-x: hidden;
}

/* Typography */
h1, h2, h3 { color: var(--secondary); font-weight: 600; }
p { color: var(--text-muted); line-height: 1.5; }

/* Utility Classes */
.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius);
    box-shadow: var(--glass-shadow);
}
.mt-2 { margin-top: 1.5rem; }
.p-2 { padding: 1.5rem; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.w-100 { width: 100%; }

/* Buttons */
.btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
}
.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
}

/* Layout Container */
.app-container {
    display: flex;
    height: 100vh;
}

/* Sidebar */
.sidebar {
    width: var(--sidebar-width);
    height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    border-right: 1px solid var(--glass-border);
    z-index: 10;
}
.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.2rem;
    color: var(--primary);
    margin-bottom: 40px;
    padding: 10px;
}
.logo h2 { color: var(--primary); font-weight: 700; }

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.nav-item {
    background: transparent;
    border: none;
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 12px;
}
.nav-item:hover {
    background: rgba(255, 107, 0, 0.1);
    color: var(--primary);
}
.nav-item.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
}

/* Main Content */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
}

/* Header */
.top-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    margin: 20px 30px;
}
.user-profile {
    display: flex;
    align-items: center;
    gap: 15px;
}
.avatar {
    width: 40px;
    height: 40px;
    background: var(--primary-light);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

/* Content Area */
.content-wrapper {
    padding: 0 30px 30px 30px;
    position: relative;
}

/* Sections visibility */
.page-section {
    display: none;
    animation: fadeIn 0.4s ease-out forwards;
}
.page-section.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Stats Grid (Overview) */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}
.stat-card {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: var(--transition);
}
.stat-card:hover {
    transform: translateY(-5px);
}
.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    background: rgba(255, 107, 0, 0.1);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
}
.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-top: 5px;
}

/* Charts Container */
.charts-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}
.chart-card {
    padding: 20px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
}
.chart-card h3 {
    margin-bottom: 20px;
    font-size: 1.2rem;
}
.canvas-container {
    position: relative;
    flex: 1;
    min-height: 250px;
    width: 100%;
}

/* Forms */
.form-container {
    padding: 25px;
}
.form-group {
    margin-bottom: 15px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--secondary);
}
.form-group input, .form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    outline: none;
    transition: var(--transition);
    font-family: 'Inter', sans-serif;
}
.form-group input:focus, .form-group select:focus {
    border-color: var(--primary);
    background: white;
}

/* Tables */
.table-container {
    padding: 20px;
    overflow-x: auto;
}
.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th, .data-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}
.data-table th {
    font-weight: 600;
    color: var(--text-muted);
}
.data-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* Split Layout */
.split-layout {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

/* Sub tabs */
.tabs-sub {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    border-bottom: 2px solid rgba(0,0,0,0.05);
    padding-bottom: 10px;
}
.sub-tab {
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    padding: 8px 16px;
    transition: var(--transition);
}
.sub-tab.active {
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
}

/* Badges */
.badge {
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}
.badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.badge-primary { background: rgba(255, 107, 0, 0.1); color: var(--primary); }

/* Progress bar inside table/cards */
.progress-track {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 1s ease-in-out;
}

/* Personnel Grid */
.personnel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.personnel-card {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.p-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.p-avatar {
    width: 50px;
    height: 50px;
    background: var(--primary-light);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

/* Barcode Simulation */
.barcode-preview {
    text-align: center;
    padding: 20px;
}
.barcode-box img {
    max-width: 100%;
    height: auto;
}
.barcode-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
}

/* Responsive */
@media (max-width: 768px) {
    .app-container { flex-direction: column; }
    .sidebar { width: 100%; height: auto; flex-direction: row; overflow-x: auto; padding: 10px; }
    .logo { margin-bottom: 0; }
    .nav-menu { flex-direction: row; gap: 5px; }
    .nav-item span { display: none; } /* Hide text on mobile */
    .top-header { margin: 10px; height: auto; padding: 15px; }
    .charts-container { grid-template-columns: 1fr; }
    .split-layout { flex-direction: column; }
}

/* Login Overlay */
#login-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1920&auto=format&fit=crop') center/cover;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}
#login-overlay::before {
    content: '';
    position: absolute;
    top:0; left:0; right:0; bottom:0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
}
.login-box {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
    text-align: center;
    z-index: 10000;
}
.login-box h2 { margin-bottom: 5px; color: var(--primary); }
.login-box i { font-size: 3rem; color: var(--primary); margin-bottom: 10px; }

/* Modals */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    background: var(--bg-white);
    padding: 25px;
    width: 400px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 10px;
}
.close-modal {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
}
.close-modal:hover { color: var(--danger); }

/* Buttons Ext */
.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: var(--transition);
}
.btn-danger:hover {
    background: var(--danger);
    color: white;
}

``

## js/app.js
``javascript
// Mock Data
const mockData = {
    users: [
        { id: 1, username: "admin", password: "123", role: "Sistem Yöneticisi", permissions: ["overview", "personnel", "work-study", "loading", "planning", "barcode", "settings"] },
        { id: 2, username: "etütçü", password: "123", role: "Etüt Sorumlusu", permissions: ["overview", "work-study"] },
        { id: 3, username: "a", password: "a", role: "Geliştirici", permissions: ["overview", "personnel", "work-study", "loading", "planning", "barcode", "settings"] }
    ],
    personnel: [
        { id: 1, name: "Ahmet Yılmaz", dept: "Kesim", shift: "08:00 - 16:00", target: 500, actual: 450 },
        { id: 2, name: "Ayşe Demir", dept: "Dikim", shift: "08:00 - 16:00", target: 400, actual: 420 },
        { id: 3, name: "Mehmet Kaya", dept: "Ütü/Paket", shift: "16:00 - 00:00", target: 600, actual: 580 },
        { id: 4, name: "Fatma Çelik", dept: "Dikim", shift: "08:00 - 16:00", target: 400, actual: 390 },
        { id: 5, name: "Mustafa Can", dept: "Kalite", shift: "08:00 - 16:00", target: 800, actual: 810 }
    ],
    studies: [
        { name: "Ayşe Demir", model: "Kadın Elbise", dept: "Dikim", time: "09:00 - 10:00", target: 50, amount: 55, efficiency: 110 },
        { name: "Ahmet Yılmaz", model: "Erkek T-Shirt", dept: "Kesim", time: "09:00 - 10:00", target: 60, amount: 60, efficiency: 100 },
        { name: "Fatma Çelik", model: "Kadın Elbise", dept: "Dikim", time: "10:00 - 11:00", target: 55, amount: 45, efficiency: 82 }
    ],
    orders: [
        { id: "ORD-001", customer: "ZARA", model: "Kadın Elbise", qty: 5000, start: "2023-11-01", end: "2023-11-15", status: "Üretimde", cuttingTarget: 500, operations: [
            { id: 1, opId: 1, orderIndex: 1, hourlyTarget: 120 },
            { id: 2, opId: 2, orderIndex: 2, hourlyTarget: 90 },
            { id: 3, opId: 3, orderIndex: 3, hourlyTarget: 150 }
        ] },
        { id: "ORD-002", customer: "H&M", model: "Erkek T-Shirt", qty: 3000, start: "2023-11-05", end: "2023-11-12", status: "Kesimde", cuttingTarget: 800, operations: [
            { id: 1, opId: 1, orderIndex: 1, hourlyTarget: 140 },
            { id: 2, opId: 4, orderIndex: 2, hourlyTarget: 110 }
        ] },
        { id: "ORD-003", customer: "MANGO", model: "Çocuk Pantolon", qty: 8000, start: "2023-11-10", end: "2023-11-30", status: "Planlandı", cuttingTarget: 0, operations: [] }
    ],
    settingsOperations: [
        { id: 1, name: "Overlok Yan Çatım" },
        { id: 2, name: "Düz Dikiş" },
        { id: 3, name: "Yaka Takma" },
        { id: 4, name: "Etek Kıvırma" }
    ],
    lots: [
        { lotNo: "LOT-ZRA-101", model: "Kadın Elbise / Kırmızı", qty: 500, stage: "Dikim", badge: "badge-primary" },
        { lotNo: "LOT-ZRA-102", model: "Kadın Elbise / Siyah", qty: 500, stage: "Kalite", badge: "badge-warning" },
        { lotNo: "LOT-HM-201", model: "Erkek T-Shirt / Beyaz", qty: 1000, stage: "Paketleme", badge: "badge-success" }
    ],
    personnelHistory: [
        { id: 1, personnelId: 2, date: '2026-04-05', dept: 'Dikim', op: 'Yaka Takma', amount: 1070 }
    ]
};

// Data Persistence Logic
function saveData() {
    try {
        localStorage.setItem('texTrackData', JSON.stringify(mockData));
    } catch(e) { console.warn("Local storage kullanılamıyor."); }
}

function loadData() {
    try {
        const saved = localStorage.getItem('texTrackData');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(mockData, parsed);
        }
    } catch(e) { console.warn("Local storage okunamadı."); }
}

// Auth Logic
let currentUser = null;

const rolePermissions = {
    "Admin": ["overview", "personnel", "work-study", "loading", "planning", "barcode", "settings"],
    "Patron": ["overview", "personnel", "work-study", "loading", "planning", "barcode"],
    "Müdür": ["overview", "personnel", "work-study", "loading", "planning", "barcode"],
    "Etütçü": ["overview", "work-study"],
    "Planlamacı": ["overview", "planning"],
    "Kesimci": ["overview", "planning"],
    "Sevkiyat": ["overview", "barcode", "loading"]
};

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const remember = document.getElementById('login-remember').checked;
    
    const foundUser = mockData.users.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);
    
    if(foundUser) {
        currentUser = foundUser;
        
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
    } else {
        alert("Hatalı kullanıcı adı veya şifre!");
    }
});

window.logout = function() {
    currentUser = null;
    try {
        localStorage.removeItem('texTrackUser');
        localStorage.removeItem('texTrackPass');
    } catch (e) {}
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-form').reset();
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
    
    if(firstAllowed) {
        firstAllowed.click();
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

// Initialize Functions
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initChart();
    renderPersonnel();
    renderStudyRecords();
    renderPlanning();
    renderLots();
    populateSelects();
    populateModelSelects();
    renderSettingsOperations();
    renderUsers();
    
    // Auto-login check
    try {
        const savedUser = localStorage.getItem('texTrackUser');
        const savedPass = localStorage.getItem('texTrackPass');
        if (savedUser && savedPass) {
            document.getElementById('login-user').value = savedUser;
            document.getElementById('login-pass').value = savedPass;
            document.getElementById('login-remember').checked = true;
            
            // Trigger submit
            const evt = new Event('submit', { cancelable: true });
            document.getElementById('login-form').dispatchEvent(evt);
        }
    } catch(e) {
        console.warn("Local storage check failed.");
    }
});

function initChart() {
    try {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
            datasets: [{
                label: 'Gerçekleşen Üretim',
                data: [120, 150, 140, 160, 110, 170, 165, 180, 150],
                borderColor: '#ff6b00',
                backgroundColor: 'rgba(255, 107, 0, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
    } catch(e) { console.error("Chart yüklenemedi", e); }
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
    mockData.personnel.forEach(p => {
        // Calculate dynamic actual and target from studies
        const pStudies = mockData.studies.filter(s => s.name === p.name);
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

        html += `
        <div class="personnel-card glass">
            <div class="p-card-header">
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="p-avatar"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <h3 style="font-size:1.1rem; color:#2c3e50;">${p.name}</h3>
                        <p style="font-size:0.85rem;">${p.dept} | ${p.shift}</p>
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

function renderStudyRecords() {
    const tbody = document.getElementById('study-records');
    let html = '';
    mockData.studies.forEach(s => {
        let badge = s.efficiency >= 100 ? 'badge-success' : (s.efficiency >= 85 ? 'badge-warning' : 'badge-danger');
        html += `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.model || '-'}</td>
            <td>${s.dept}</td>
            <td>${s.time}</td>
            <td>${s.amount}</td>
            <td><span class="badge ${badge}">%${s.efficiency}</span></td>
        </tr>
        `;
    });
    tbody.innerHTML = html;
}

function populateSelects() {
    const select = document.getElementById('study-personnel');
    select.innerHTML = '';
    mockData.personnel.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.innerText = p.name + ' (' + p.dept + ')';
        select.appendChild(option);
    });
}

function populateModelSelects() {
    const select = document.getElementById('study-model');
    select.innerHTML = '<option value="">Model Seçin</option>';
    mockData.orders.forEach(o => {
        const option = document.createElement('option');
        option.value = o.id;
        option.innerText = o.customer + ' - ' + o.model;
        select.appendChild(option);
    });
}

document.getElementById('study-model').addEventListener('change', (e) => {
    const orderId = e.target.value;
    const opSelect = document.getElementById('study-operation');
    const targetDisplay = document.getElementById('study-dynamic-target');
    const targetHidden = document.getElementById('study-target-hidden');
    
    opSelect.innerHTML = '<option value="">Operasyon Seçin</option>';
    targetDisplay.innerText = '--';
    targetHidden.value = '0';
    
    if(!orderId) return;
    
    const order = mockData.orders.find(o => o.id === orderId);
    if(order && order.operations) {
        order.operations.forEach(op => {
            const opRef = mockData.settingsOperations.find(so => so.id === op.opId);
            if(opRef) {
                const option = document.createElement('option');
                option.value = op.id;
                option.innerText = opRef.name;
                option.dataset.target = op.hourlyTarget;
                opSelect.appendChild(option);
            }
        });
    }
});

document.getElementById('study-operation').addEventListener('change', (e) => {
    const targetDisplay = document.getElementById('study-dynamic-target');
    const targetHidden = document.getElementById('study-target-hidden');
    const selectedOption = e.target.options[e.target.selectedIndex];
    
    if(selectedOption && selectedOption.value !== "") {
        const targetVal = selectedOption.dataset.target;
        targetDisplay.innerText = targetVal + " Adet / Saat";
        targetHidden.value = targetVal;
    } else {
        targetDisplay.innerText = '--';
        targetHidden.value = '0';
    }
});

// Form Submit Event
document.getElementById('study-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pId = parseInt(document.getElementById('study-personnel').value);
    const p = mockData.personnel.find(x => x.id === pId);
    
    const orderId = document.getElementById('study-model').value;
    if(!orderId) return alert('Lütfen model seçin.');
    const order = mockData.orders.find(o => o.id === orderId);
    const modelName = order ? order.model : "-";
    
    const opSelect = document.getElementById('study-operation');
    const opId = opSelect.value;
    if(!opId) return alert('Lütfen operasyon seçin.');
    
    const timeSelects = e.target.querySelectorAll('select');
    const time = timeSelects[2].value; 
    
    const target = parseInt(document.getElementById('study-target-hidden').value) || 0;
    const actual = parseInt(document.getElementById('study-actual').value);
    
    const eff = target > 0 ? Math.round((actual / target) * 100) : 0;
    
    mockData.studies.unshift({
        name: p.name,
        model: modelName,
        dept: p.dept,
        time: time,
        target: target,
        amount: actual,
        efficiency: eff
    });
    saveData();
    
    renderStudyRecords();
    renderPersonnel();
    alert('Etüt kaydı başarıyla eklendi!');
    e.target.reset();
    document.getElementById('study-dynamic-target').innerText = '--';
});

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
    const tbody = document.getElementById('planning-records');
    let html = '';
    mockData.orders.forEach(o => {
        let bClass = o.status == 'Üretimde' ? 'badge-primary' : (o.status == 'Kesimde' ? 'badge-warning' : 'badge-success');
        html += `
        <tr>
            <td><strong>${o.customer}</strong><br><small>${o.model}</small><br><small style="color:gray;">${o.id}</small></td>
            <td>${o.qty}</td>
            <td>${o.start}</td>
            <td>${o.end}</td>
            <td><span class="badge ${bClass}">${o.status}</span></td>
            <td>
                <button class="btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="openEditModelModal('${o.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>
            </td>
        </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Lots
function renderLots() {
    const tbody = document.getElementById('lot-records');
    let html = '';
    mockData.lots.forEach(l => {
        html += `
        <tr>
            <td><strong>${l.lotNo}</strong></td>
            <td>${l.model}</td>
            <td>${l.qty}</td>
            <td><span class="badge ${l.badge}">${l.stage}</span></td>
            <td>
                <button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="document.getElementById('custom-lot').value='${l.lotNo}'; document.querySelector('[data-subtarget=barcode-gen]').click();">Barkod</button>
            </td>
        </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Barcode Gen
window.generateBarcode = function() {
    const val = document.getElementById('custom-lot').value;
    if(!val) return;
    document.getElementById('barcode-text').innerText = val;
    document.getElementById('barcode-img').src = `https://barcode.tec-it.com/barcode.ashx?data=${val}&code=Code128`;
}

// Modal Logic
window.openAddPersonnelModal = function() {
    document.getElementById('add-personnel-modal').style.display = 'flex';
}

window.openAddModelModal = function() {
    document.getElementById('add-model-modal').style.display = 'flex';
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Personnel CRUD
document.getElementById('add-personnel-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newId = mockData.personnel.length > 0 ? Math.max(...mockData.personnel.map(p => p.id)) + 1 : 1;
    const name = document.getElementById('new-p-name').value;
    const dept = document.getElementById('new-p-dept').value;
    const shift = document.getElementById('new-p-shift').value;
    
    mockData.personnel.push({
        id: newId,
        name: name,
        dept: dept,
        shift: shift
    });
    saveData();
    
    renderPersonnel();
    populateSelects();
    closeModal('add-personnel-modal');
    e.target.reset();
});

window.deletePersonnel = function(id) {
    if(confirm('Bu personeli silmek istediğinize emin misiniz?')) {
        mockData.personnel = mockData.personnel.filter(p => p.id !== id);
        saveData();
        renderPersonnel();
        populateSelects();
    }
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

document.getElementById('add-model-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const customer = document.getElementById('new-m-customer').value;
    const name = document.getElementById('new-m-name').value;
    const qty = document.getElementById('new-m-qty').value;
    const start = document.getElementById('new-m-start').value;
    const end = document.getElementById('new-m-end').value;
    
    const newId = "ORD-" + (mockData.orders.length > 0 ? (mockData.orders.length + 1).toString().padStart(3, '0') : "001");
    
    mockData.orders.push({
        id: newId,
        customer: customer,
        model: name,
        qty: parseInt(qty),
        start: start,
        end: end,
        status: "Planlandı"
    });
    saveData();
    
    renderPlanning();
    populateModelSelects();
    closeModal('add-model-modal');
    e.target.reset();
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
    
    tbody.innerHTML = html;
    select.innerHTML = selectHtml;
}

document.getElementById('settings-op-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-op-name').value;
    const newId = mockData.settingsOperations.length > 0 ? Math.max(...mockData.settingsOperations.map(o => o.id)) + 1 : 1;
    mockData.settingsOperations.push({ id: newId, name: name });
    saveData();
    renderSettingsOperations();
    e.target.reset();
});

window.deleteSettingOp = function(id) {
    if(confirm('Operasyonu silmek istediğinize emin misiniz?')) {
        mockData.settingsOperations = mockData.settingsOperations.filter(o => o.id !== id);
        saveData();
        renderSettingsOperations();
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

document.getElementById('add-model-op-form').addEventListener('submit', (e) => {
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
    const tbody = document.getElementById('settings-user-list');
    let html = '';
    mockData.users.forEach(u => {
        let permText = u.permissions && u.permissions.length > 0 ? (u.permissions.length + " Sayfa") : "Yok";
        html += `
        <tr>
            <td>${u.username}</td>
            <td><span class="badge badge-primary">${u.role}</span></td>
            <td>${permText}</td>
            <td>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
    });
    tbody.innerHTML = html;
}

document.getElementById('settings-user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const uName = document.getElementById('new-u-name').value;
    const uPass = document.getElementById('new-u-pass').value;
    const uRole = document.getElementById('new-u-role').value;
    
    const permChks = document.querySelectorAll('.perm-chk');
    const selectedPerms = [];
    permChks.forEach(chk => {
        if(chk.checked) selectedPerms.push(chk.value);
    });
    
    const newId = mockData.users.length > 0 ? Math.max(...mockData.users.map(u => u.id)) + 1 : 1;
    mockData.users.push({ id: newId, username: uName, password: uPass, role: uRole, permissions: selectedPerms });
    saveData();
    
    renderUsers();
    e.target.reset();
});

window.deleteUser = function(id) {
    if(currentUser && currentUser.id === id) {
        alert("Kendi hesabınızı silemezsiniz!");
        return;
    }
    if(confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) {
        mockData.users = mockData.users.filter(u => u.id !== id);
        saveData();
        renderUsers();
    }
}

// Language Support
const i18n = {
    en: {
        "Sisteme giriş yapın": "Login to the system",
        "Kullanıcı Adı": "Username",
        "Åifre": "Password",
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
        "Paketleme": "Packaging"
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

// Start observing after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    langObserver.observe(document.body, { childList: true, subtree: true });
});

``

