// ==============================================
// ANMAGO STORE - APP.JS OPTIMIZADO
// Sistema de navegación y productos simplificado
// ==============================================

// ========== VARIABLES GLOBALES ==========
let productosGlobal = [];
let productosCargados = 0;
let cargandoScroll = false;
const LIMITE_PRODUCTOS = 12;
const URL_CATALOGO = "https://raw.githubusercontent.com/anmagoS/anmago.store/main/catalogo.json";

// Iconos para categorías
const ICONOS = {
    'TODOS': '🛍️',
    'ROPA': '👗',
    'RELOJERIA': '⌚',
    'HOGAR': '🏠',
    'BELLEZA': '💄',
    'NAVIDAD': '🎄',
    'ESCOLAR': '🎒'
};

// ========== FUNCIONES DE CARGA ==========

async function cargarCatalogoGlobal() {
    try {
        console.log('📦 Cargando catálogo...');
        const response = await fetch(URL_CATALOGO + '?t=' + Date.now());
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const productos = await response.json();
        
        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error('Catálogo vacío');
        }
        
        productosGlobal = productos.map(p => ({
            ...p,
            precio: Number(p.precio) || 0,
            stock: Number(p.stock) || 0,
            promo: p.promo === true || p.promo === "true" || p.promo === "sí"
        }));
        
        console.log(`✅ ${productosGlobal.length} productos cargados`);
        
        // Disparar evento para que otros scripts sepan que el catálogo está listo
        window.dispatchEvent(new CustomEvent('catalogoCargado'));
        
        return productosGlobal;
        
    } catch (error) {
        console.error('❌ Error cargando catálogo:', error);
        productosGlobal = [];
        return [];
    }
}

// ========== RENDERIZADO DE PRODUCTOS ==========

function crearCardProductoHTML(producto) {
    const precioOriginal = Number(producto.precio) || 0;
    const estaEnPromo = producto.promo === true;
    const precioFinal = estaEnPromo ? Math.round(precioOriginal * 0.9) : precioOriginal;
    const descuento = estaEnPromo ? Math.round((1 - precioFinal / precioOriginal) * 100) : 0;
    
    // Obtener imagen
    let imagen = 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
    if (producto.imagenes?.length > 0) {
        const imgPrincipal = producto.imagenes.find(img => img.tipo === "PRINCIPAL");
        imagen = imgPrincipal?.url || producto.imagenes[0].url;
    } else if (producto.imagen) {
        imagen = producto.imagen;
    }
    
    const badgePromo = estaEnPromo ? `<div class="badge-promo">-${descuento}%</div>` : '';
    const badgeStock = producto.stock <= 5 && producto.stock > 0 ? 
        `<div class="badge-stock">Últimas ${producto.stock}</div>` : '';
    
    return `
    <div class="card-producto-ml" data-id="${producto.id}">
        <a href="PRODUCTO.HTML?id=${producto.id}" class="card-link">
            <div class="card-image-container">
                <img src="${imagen}" 
                     alt="${producto.producto}" 
                     class="card-img-ml"
                     loading="lazy"
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                ${badgePromo}
                ${badgeStock}
            </div>
            
            <div class="card-content">
                <div class="categorias">
                    ${producto.tipo ? `<span class="categoria-tipo">${producto.tipo}</span>` : ''}
                    ${producto.subtipo ? `<span class="categoria-subtipo">${producto.subtipo}</span>` : ''}
                </div>
                
                <h3 class="producto-nombre">${producto.producto}</h3>
                
                <div class="card-footer">
                    <div class="precios">
                        <div class="precio-actual">$${precioFinal.toLocaleString('es-CO')}</div>
                        ${estaEnPromo ? `
                            <div class="precio-anterior">$${precioOriginal.toLocaleString('es-CO')}</div>
                        ` : ''}
                    </div>
                    
                    <button class="btn-ver-producto" 
                            onclick="event.preventDefault(); event.stopPropagation(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        </a>
    </div>`;
}

// ========== GESTIÓN DE VISTAS ==========

function cambiarAVista(nombreVista) {
    console.log(`📱 Cambiando a vista: ${nombreVista}`);
    
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    const vista = document.getElementById(`vista-${nombreVista}`);
    if (vista) {
        vista.classList.add('vista-activa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ========== CATEGORÍAS RÁPIDAS CON NAVEGACIÓN DINÁMICA ==========

function inicializarCategoriasRapidas() {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor || productosGlobal.length === 0) return;
    
    const tiposUnicos = ['TODOS', ...new Set(productosGlobal.map(p => p.tipo).filter(Boolean))];
    
    const html = tiposUnicos.map(tipo => {
        const icono = ICONOS[tipo] || '📦';
        
        return `
        <div class="categoria-rapida-contenedor">
            <a href="#" class="categoria-rapida" 
               onclick="event.preventDefault(); mostrarProductosCategoriaRapida('${tipo}')">
                <div>${icono}</div>
                <div>${tipo}</div>
            </a>
        </div>`;
    }).join('');
    
    contenedor.innerHTML = html;
}

// ========== MOSTRAR PRODUCTOS DINÁMICAMENTE EN INICIO ==========

function mostrarProductosCategoriaRapida(tipo) {
    console.log(`🎯 Mostrando productos de: ${tipo}`);
    
    const vistaInicio = document.getElementById('vista-inicio');
    const gridUltimos = document.getElementById('grid-ultimos');
    
    if (!vistaInicio || !gridUltimos) return;
    
    // Asegurar que estamos en la vista inicio
    cambiarAVista('inicio');
    
    // Actualizar título de la sección
    const tituloSeccion = document.getElementById('titulo-productos-inicio');
    if (tituloSeccion) {
        tituloSeccion.textContent = tipo === 'TODOS' ? 'Productos destacados' : `Productos de ${tipo}`;
    }
    
    // Filtrar productos
    const productosFiltrados = tipo === 'TODOS' 
        ? productosGlobal 
        : productosGlobal.filter(p => p.tipo === tipo);
    
    // Mostrar productos
    if (productosFiltrados.length === 0) {
        gridUltimos.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h5 class="mt-3">No se encontraron productos en esta categoría</h5>
                <button class="btn btn-outline-primary mt-2" onclick="volverAInicio()">
                    Volver al inicio
                </button>
            </div>`;
        return;
    }
    
    // Mostrar máximo 8 productos en la vista rápida
    const productosMostrar = productosFiltrados.slice(0, 8);
    gridUltimos.innerHTML = productosMostrar.map(p => crearCardProductoHTML(p)).join('');
    
    // Agregar botón para ver todos si hay más productos
    if (productosFiltrados.length > 8) {
        gridUltimos.insertAdjacentHTML('beforeend', `
            <div class="col-12 text-center mt-4">
                <button class="btn btn-primary" onclick="verTodosProductosCategoria('${tipo}')">
                    <i class="bi bi-arrow-right"></i> Ver todos los productos (${productosFiltrados.length})
                </button>
            </div>
        `);
    }
}

function verTodosProductosCategoria(tipo) {
    console.log(`📦 Ver todos los productos de: ${tipo}`);
    
    if (tipo === 'TODOS') {
        mostrarTodosLosProductosCompleto();
    } else {
        cargarPorTipo(tipo);
    }
}

// ========== NAVEGACIÓN POR CATEGORÍAS ==========

function cargarPorTipo(tipo) {
    console.log(`📁 Cargando tipo: ${tipo}`);
    
    if (tipo === 'TODOS') {
        cambiarAVista('todos');
        cargarVistaTodos();
        actualizarURL();
        return;
    }
    
    cambiarAVista('productos');
    
    // Actualizar breadcrumbs
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-subtipo-link').textContent = '';
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${tipo}`;
    
    // Filtrar y mostrar productos
    const productosFiltrados = productosGlobal.filter(p => p.tipo === tipo);
    mostrarProductos(productosFiltrados);
    
    // Actualizar URL
    actualizarURL(tipo);
}

function mostrarProductos(productos) {
    const grid = document.getElementById('grid-productos');
    const contador = document.getElementById('contador-productos');
    
    if (!grid) return;
    
    if (contador) {
        contador.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
    }
    
    if (productos.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h5 class="mt-3">No se encontraron productos</h5>
                <button class="btn btn-outline-primary mt-2" onclick="volverAInicio()">
                    Volver al inicio
                </button>
            </div>`;
        return;
    }
    
    grid.innerHTML = productos.map(p => crearCardProductoHTML(p)).join('');
}

// ========== VISTA TODOS LOS PRODUCTOS ==========

async function cargarVistaTodos() {
    const grid = document.getElementById('grid-todos');
    const contador = document.getElementById('contador-todos');
    const loader = document.getElementById('cargando-todos');
    
    if (!grid) return;
    
    productosCargados = 0;
    grid.innerHTML = '';
    
    if (contador) contador.textContent = `${productosGlobal.length} productos`;
    if (loader) loader.classList.remove('d-none');
    
    if (productosGlobal.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h5 class="mt-3">No hay productos disponibles</h5>
            </div>`;
        return;
    }
    
    await cargarMasProductos();
    if (loader) loader.classList.add('d-none');
}

async function cargarMasProductos() {
    if (cargandoScroll || productosCargados >= productosGlobal.length) return;
    
    const grid = document.getElementById('grid-todos');
    if (!grid) return;
    
    cargandoScroll = true;
    
    const inicio = productosCargados;
    const fin = Math.min(inicio + LIMITE_PRODUCTOS, productosGlobal.length);
    const productos = productosGlobal.slice(inicio, fin);
    
    productos.forEach(producto => {
        grid.insertAdjacentHTML('beforeend', crearCardProductoHTML(producto));
    });
    
    productosCargados = fin;
    actualizarBotonVerMas();
    
    cargandoScroll = false;
}

function actualizarBotonVerMas() {
    const btnContainer = document.getElementById('btn-ver-mas-container');
    if (!btnContainer) return;
    
    const restantes = productosGlobal.length - productosCargados;
    
    if (restantes > 0) {
        btnContainer.classList.remove('d-none');
        btnContainer.innerHTML = `
            <button onclick="cargarMasProductos()" class="btn btn-outline-primary">
                <i class="bi bi-arrow-down"></i> Ver más (${restantes})
            </button>`;
    } else {
        btnContainer.classList.add('d-none');
    }
}

// ========== GESTIÓN DE URL ==========

function actualizarURL(tipo = null) {
    const url = new URL(window.location);
    url.searchParams.delete('tipo');
    url.searchParams.delete('subtipo');
    url.searchParams.delete('categoria');
    
    if (tipo) {
        url.searchParams.set('tipo', tipo);
    }
    
    window.history.pushState({}, '', url);
}

function getParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        tipo: params.get('tipo')?.trim()
    };
}

// ========== NAVEGACIÓN ==========

function volverAInicio() {
    console.log('🏠 Volviendo al inicio...');
    
    // Cambiar a vista inicio
    cambiarAVista('inicio');
    
    // Mostrar productos iniciales (ej: 8 productos aleatorios o destacados)
    const productosDestacados = productosGlobal.slice(0, 8);
    const gridUltimos = document.getElementById('grid-ultimos');
    
    if (gridUltimos) {
        gridUltimos.innerHTML = productosDestacados.map(p => crearCardProductoHTML(p)).join('');
    }
    
    // Limpiar URL
    const url = new URL(window.location);
    url.searchParams.delete('tipo');
    window.history.pushState({}, '', url);
}

function mostrarTodosLosProductosCompleto() {
    cargarPorTipo('TODOS');
}

// ========== CONFIGURACIÓN DE EVENTOS ==========

function configurarScrollInfinito() {
    let timeout;
    
    window.addEventListener('scroll', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const vistaTodos = document.getElementById('vista-todos')?.classList.contains('vista-activa');
            if (!vistaTodos || cargandoScroll) return;
            
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                cargarMasProductos();
            }
        }, 100);
    }, { passive: true });
}

// ========== MENÚ HAMBURGUESA ==========

function cargarCategoriasEnMenuDesdeAppJS() {
    const contenedor = document.getElementById('menu-categorias-dinamico');
    if (!contenedor || productosGlobal.length === 0) return;
    
    const tiposUnicos = [...new Set(productosGlobal.map(p => p.tipo).filter(Boolean))];
    
    let html = '<p class="small text-muted mb-2"><i class="bi bi-tags me-1"></i> Categorías</p>';
    html += '<div class="d-flex flex-column gap-2">';
    
    // Opción "Todos"
    html += `
        <a href="#" class="nav-link d-flex justify-content-between align-items-center py-2 px-3 rounded"
           onclick="event.preventDefault(); mostrarTodosLosProductosCompleto(); cerrarMenu();">
            <div class="d-flex align-items-center">
                <i class="bi bi-grid-fill me-2 text-primary"></i>
                <span class="fw-bold">TODOS</span>
            </div>
        </a>`;
    
    // Categorías
    tiposUnicos.forEach(tipo => {
        html += `
            <a href="#" class="nav-link d-flex justify-content-between align-items-center py-2 px-3 rounded"
               onclick="event.preventDefault(); cargarPorTipo('${tipo}'); cerrarMenu();">
                <div class="d-flex align-items-center">
                    <i class="bi bi-folder me-2"></i>
                    <span>${tipo}</span>
                </div>
            </a>`;
    });
    
    html += '</div>';
    contenedor.innerHTML = html;
    
    console.log('✅ Menú hamburguesa cargado');
}

function cerrarMenu() {
    const menu = document.getElementById('menuLateral');
    if (menu) {
        const offcanvas = bootstrap?.Offcanvas?.getInstance(menu);
        if (offcanvas) offcanvas.hide();
    }
}

// ========== INICIALIZAR PRODUCTOS EN INICIO ==========

function inicializarProductosInicio() {
    const gridUltimos = document.getElementById('grid-ultimos');
    if (!gridUltimos || productosGlobal.length === 0) return;
    
    // Mostrar primeros 8 productos (o productos destacados)
    const productosDestacados = productosGlobal.slice(0, 8);
    
    if (productosDestacados.length === 0) {
        gridUltimos.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-box fs-1 text-muted"></i>
                <h5 class="mt-3">No hay productos disponibles</h5>
            </div>`;
        return;
    }
    
    gridUltimos.innerHTML = productosDestacados.map(p => crearCardProductoHTML(p)).join('');
}

// ========== INICIALIZACIÓN ==========

async function inicializarApp() {
    console.log('🚀 Iniciando Anmago Store...');
    
    try {
        // 1. Cargar catálogo
        await cargarCatalogoGlobal();
        
        // 2. Inicializar productos en vista inicio
        inicializarProductosInicio();
        
        // 3. Inicializar categorías rápidas
        inicializarCategoriasRapidas();
        
        // 4. Cargar menú hamburguesa
        setTimeout(cargarCategoriasEnMenuDesdeAppJS, 500);
        
        // 5. Configurar scroll infinito
        configurarScrollInfinito();
        
        // 6. Manejar URL
        const { tipo } = getParametrosURL();
        
        if (tipo) {
            setTimeout(() => cargarPorTipo(tipo), 500);
        }
        
        console.log('✅ App inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
    }
}

// ========== INICIO ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========

window.volverAInicio = volverAInicio;
window.cargarPorTipo = cargarPorTipo;
window.mostrarProductosCategoriaRapida = mostrarProductosCategoriaRapida;
window.verTodosProductosCategoria = verTodosProductosCategoria;
window.mostrarTodosLosProductosCompleto = mostrarTodosLosProductosCompleto;
window.cargarMasProductos = cargarMasProductos;
window.cerrarMenu = cerrarMenu;
window.productosGlobal = productosGlobal;
