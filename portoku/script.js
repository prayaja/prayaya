/* =======================================================================
   TAMBAHKAN LINK GOOGLE DRIVE KAMU DI SINI
   -----------------------------------------------------------------------
   - Tempel link folder atau file Google Drive di dalam array di bawah.
   - Pastikan setelan berbagi file/folder = "Siapa saja yang memiliki link".
   - Boleh campur link folder dan link file dalam array yang sama.
   - "title" akan tampil sebagai judul kartu di galeri (boleh diubah bebas).
   ======================================================================= */
const DRIVE_LINKS = [
  // { url: "https://drive.google.com/file/d/CONTOH_ID_FILE/view", title: "Editan 1" },
  // { url: "https://drive.google.com/drive/folders/CONTOH_ID_FOLDER", title: "Folder Portofolio" },
];

// =========================================================================

let driveItems = [];

// ---------------- Google Drive link parsing ----------------
function parseDriveLink(url){
  url = url.trim();
  if(!url) return null;

  let m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if(m) return { type:'folder', id:m[1] };

  m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if(m) return { type:'file', id:m[1] };

  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if(m) return { type:'file', id:m[1] };

  return null;
}

function embedSrc(item){
  if(item.type === 'folder'){
    return `https://drive.google.com/embeddedfolderview?id=${item.id}#grid`;
  }
  return `https://drive.google.com/file/d/${item.id}/preview`;
}

// ---------------- Load links from the DRIVE_LINKS config ----------------
function loadConfigLinks(){
  DRIVE_LINKS.forEach((entry, i) => {
    const parsed = parseDriveLink(entry.url);
    if(parsed){
      driveItems.push({
        ...parsed,
        title: entry.title || (parsed.type === 'folder' ? 'Folder Karya' : `Karya ${i + 1}`)
      });
    }
  });
}

// ---------------- Gallery rendering ----------------
const galleryEl = document.getElementById('gallery');
const emptyState = document.getElementById('emptyState');
const galeryCount = document.getElementById('galeryCount');

function renderGallery(){
  galleryEl.querySelectorAll('.card').forEach(c => c.remove());

  emptyState.style.display = driveItems.length === 0 ? 'block' : 'none';

  driveItems.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'card glass';
    card.innerHTML = `
      <div class="card-frame">
        <iframe src="${embedSrc(item)}" loading="lazy" allow="autoplay" allowfullscreen></iframe>
      </div>
      <div class="card-row">
        <input class="card-title" value="${item.title}" data-idx="${idx}">
        <button class="card-remove" data-idx="${idx}" aria-label="Hapus karya">🗑</button>
      </div>
    `;
    galleryEl.appendChild(card);
  });

  galeryCount.textContent = `${driveItems.length} karya ditampilkan`;

  galleryEl.querySelectorAll('.card-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      driveItems.splice(Number(btn.dataset.idx), 1);
      renderGallery();
    });
  });
  galleryEl.querySelectorAll('.card-title').forEach(inp => {
    inp.addEventListener('input', () => {
      driveItems[Number(inp.dataset.idx)].title = inp.value;
    });
  });
}

document.getElementById('addBtn').addEventListener('click', addLinks);
document.getElementById('driveInput').addEventListener('keydown', e => {
  if(e.key === 'Enter') addLinks();
});

function addLinks(){
  const raw = document.getElementById('driveInput').value;
  if(!raw.trim()) return;

  const parts = raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  let addedAny = false;

  parts.forEach(url => {
    const parsed = parseDriveLink(url);
    if(parsed){
      driveItems.push({
        ...parsed,
        title: parsed.type === 'folder' ? 'Folder Karya' : `Karya ${driveItems.length + 1}`
      });
      addedAny = true;
    }
  });

  if(addedAny){
    document.getElementById('driveInput').value = '';
    renderGallery();
  } else {
    alert('Link Google Drive tidak dikenali. Pastikan link folder atau file Drive yang valid.');
  }
}

loadConfigLinks();
renderGallery();

// ---------------- Background dock ----------------
const bgLayer = document.getElementById('bgLayer');
const dockOverlay = document.getElementById('dockOverlay');

document.getElementById('openDock').addEventListener('click', () => dockOverlay.classList.add('open'));
document.getElementById('closeDock').addEventListener('click', () => dockOverlay.classList.remove('open'));
dockOverlay.addEventListener('click', e => { if(e.target === dockOverlay) dockOverlay.classList.remove('open'); });

const presets = {
  1:'linear-gradient(135deg,#6c5ce7,#ff5fa8)',
  2:'linear-gradient(135deg,#4fd1c5,#6c5ce7)',
  3:'linear-gradient(135deg,#ffb86b,#ff5fa8)',
  4:'linear-gradient(135deg,#0f2027,#2c5364)',
  5:'linear-gradient(135deg,#f7971e,#ffd200)',
  6:'#05060a'
};

function clearActiveSwatch(){
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
}

document.querySelectorAll('.swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    bgLayer.style.backgroundImage = '';
    bgLayer.classList.remove('custom-bg', 'has-image');
    bgLayer.style.background = presets[sw.dataset.preset];
    clearActiveSwatch();
    sw.classList.add('active');
  });
});

document.getElementById('colorPicker').addEventListener('input', e => {
  bgLayer.style.backgroundImage = '';
  bgLayer.classList.remove('has-image');
  bgLayer.classList.add('custom-bg');
  bgLayer.style.background = e.target.value;
  clearActiveSwatch();
});

document.getElementById('hexInput').addEventListener('keydown', e => {
  if(e.key === 'Enter'){
    const val = e.target.value.trim();
    if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)){
      bgLayer.style.backgroundImage = '';
      bgLayer.classList.remove('has-image');
      bgLayer.classList.add('custom-bg');
      bgLayer.style.background = val;
      clearActiveSwatch();
    } else {
      alert('Format kode hex tidak valid. Contoh: #101820');
    }
  }
});

document.getElementById('applyUrlBtn').addEventListener('click', () => {
  const url = document.getElementById('bgUrlInput').value.trim();
  if(!url) return;
  bgLayer.classList.add('has-image', 'custom-bg');
  bgLayer.style.background = `url("${url}") center/cover no-repeat`;
  clearActiveSwatch();
});

document.getElementById('bgFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    bgLayer.classList.add('has-image', 'custom-bg');
    bgLayer.style.background = `url("${ev.target.result}") center/cover no-repeat`;
    clearActiveSwatch();
  };
  reader.readAsDataURL(file);
});

document.getElementById('blurRange').addEventListener('input', e => {
  document.documentElement.style.setProperty('--blur-amount', e.target.value + 'px');
});

document.getElementById('resetBg').addEventListener('click', () => {
  bgLayer.style.background = '';
  bgLayer.classList.remove('has-image', 'custom-bg');
  document.documentElement.style.setProperty('--blur-amount', '70px');
  document.getElementById('blurRange').value = 70;
  clearActiveSwatch();
  document.querySelector('.swatch[data-preset="1"]').classList.add('active');
});

// ---------------- Ambient parallax for blobs ----------------
window.addEventListener('mousemove', e => {
  const px = (e.clientX / window.innerWidth - 0.5) * 30;
  const py = (e.clientY / window.innerHeight - 0.5) * 30;
  document.getElementById('blob1').style.transform = `translate(${px}px, ${py}px)`;
  document.getElementById('blob2').style.transform = `translate(${-px}px, ${py}px)`;
  document.getElementById('blob3').style.transform = `translate(${px}px, ${-py}px)`;
  document.getElementById('blob4').style.transform = `translate(${-px}px, ${-py}px)`;
});
