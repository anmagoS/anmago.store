// ==============================================
// ANMAGO STORE - APP.JS COMPLETO CORREGIDO
// VERSIÓN: SIN INTERFERENCIA CON NAVEGACIÓN
// ==============================================
// Variables globales
let productosGlobal = [];
let vistaActual = 'inicio';
let contextoNavegacion = {
    nivel: 0,
    tipo: null,
    subtipo: null,
    categoria: null
};
let productosCargados = 0;
let cargandoScroll = false;
const LIMITE_PRODUCTOS = 12;
let esPrimeraCarga = true;

// Iconos para categorías
const ICONOS_CATEGORIAS = {
    'TODOS': '🛍️',
    'ROPA': '👗', 'RELOJERIA': '⌚',
    'HOGAR': '🏠', 'BELLEZA': '💄',
    'NAVIDAD': '🎄', 'ESCOLAR': '🎒',
    'DAMA': '👩', 'CABALLERO': '👨',
    'UNISEX': '👥', 'NIÑOS': '👦', 'NIÑAS': '👧',
};

// ==============================================
// DESACTIVAR CUALQUIER INTERFERENCIA CON NAVEGACIÓN
// ==============================================

// Esta función asegura que los clicks en productos NUNCA sean interceptados
function configurarProteccionNavegacion() {
    console.log('🔗 Configurando protección de navegación...');
    
    // Desactivar cualquier listener que esté interceptando clicks
    document.addEventListener('click', function(event) {
        const target = event.target;
        const link = target.closest('a[href*="PRODUCTO.HTML"]');
        
        if (link) {
            console.log('✅ Navegando a producto, permitiendo acción natural');
            // IMPORTANTE: NO hacer nada, dejar que el navegador maneje el click
            return;
        }
    }, false); // Usar fase de burbuja, no captura
    
    // También prevenir que otros scripts interfieran
    window.addEventListener('click', function(e) {
        if (e.target.closest('a[href*="PRODUCTO.HTML"]')) {
            // Permitir completamente la navegación
            e.stopImmediatePropagation();
        }
    }, true);
}

// ==============================================
// FUNCIONES PARA MOSTRAR/OCULTAR ELEMENTOS
// ==============================================

function mostrarSeccionPresentacion(mostrar = true) {
    const elementosParaOcultar = [
        'seccion-hero',
        'hero-section',
        'banner-institucional'
    ];
    
    elementosParaOcultar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = mostrar ? 'block' : 'none';
        }
    });
    
    // También buscar por clases
    const seccionesHero = document.querySelectorAll('.hero-section, .banner-institucional, section.py-4.py-md-5');
    seccionesHero.forEach(elemento => {
        if (elemento) {
            elemento.style.display = mostrar ? 'block' : 'none';
        }
    });
}

// ==============================================
// FUNCIONES BÁSICAS
// ==============================================

function getParametrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        tipo: params.get("tipo")?.trim(),
        subtipo: params.get("subtipo")?.trim(),
        categoria: params.get("categoria")?.trim(),
        vista: params.get("vista")?.trim()
    };
}

function obtenerIcono(categoria, nivel = 0) {
    if (nivel === 2) return '';
    return ICONOS_CATEGORIAS[categoria] || '📦';
}

function cambiarAVista(vistaNombre, hacerScroll = false, ocultarPresentacion = false) {
    console.log('📱 Cambiando a vista:', vistaNombre);
    
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    const vistaElement = document.getElementById(`vista-${vistaNombre}`);
    if (vistaElement) {
        vistaElement.classList.add('vista-activa');
    }
    
    vistaActual = vistaNombre;
    
    if (ocultarPresentacion) {
        mostrarSeccionPresentacion(false);
        esPrimeraCarga = false;
    }
    
    if (hacerScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function cargarCatalogoGlobal() {
    try {
        console.log('📦 Cargando catálogo...');
        const url = "https://raw.githubusercontent.com/anmagoS/anmago.store/main/catalogo.json";
        const res = await fetch(url);
        let productos = await res.json();
        
        productos = productos.reverse();
        productosGlobal = productos;
        console.log(`✅ ${productos.length} productos cargados`);
        
        return productos;
    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        return [];
    }
}

// ==============================================
// FUNCIÓN PARA CREAR CARD DE PRODUCTO - VERSIÓN CORREGIDA
// ==============================================

function crearCardProductoHTML(producto) {
    const precioOriginal = Number(producto.precio) || 0;
    let precioFinal = precioOriginal;
    let badgePromo = '';
    let mostrarPrecioAnterior = false;
    
    const estaEnPromo = producto.promo === true || producto.promo === "true" || producto.promo === "sí";
    
    if (estaEnPromo) {
        const descuentoPorcentaje = 10;
        precioFinal = Math.round(precioOriginal * 0.9);
        badgePromo = `<div class="badge-promo">-${descuentoPorcentaje}%</div>`;
        mostrarPrecioAnterior = true;
    }
    
    const badgeStock = producto.stock <= 5 ? 
        `<div class="badge-stock">Últimas ${producto.stock}</div>` : '';
    
    let imagenMostrar = 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
    
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        const imagenPrincipal = producto.imagenes.find(img => 
            img.tipo && img.tipo.toUpperCase() === "PRINCIPAL"
        );
        
        if (imagenPrincipal && imagenPrincipal.url) {
            imagenMostrar = imagenPrincipal.url;
        } else if (producto.imagenes[0] && producto.imagenes[0].url) {
            imagenMostrar = producto.imagenes[0].url;
        }
    } else if (producto.imagen) {
        imagenMostrar = producto.imagen;
    }
    
    // 🔥 VERSIÓN SÚPER SIMPLE - ENLACE DIRECTO SIN JS
    const cardHTML = `
    <div class="card-producto-ml" data-id="${producto.id}">
        <!-- ENLACE ABSOLUTAMENTE SIMPLE -->
        <a href="PRODUCTO.HTML?id=${producto.id}" class="card-link">
            <div class="card-image-container">
                <img src="${imagenMostrar}" 
                     alt="${producto.producto || 'Producto'}" 
                     class="card-img-ml"
                     width="300"
                     height="200"
                     loading="lazy"
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg?tr=w-300,h-200'">
                ${badgePromo}
                ${badgeStock}
            </div>
            
            <div class="card-content">
                <div class="categorias">
                    ${producto.tipo ? `<span class="categoria-tipo">${producto.tipo}</span>` : ''}
                    ${producto.subtipo ? `<span class="categoria-subtipo">${producto.subtipo}</span>` : ''}
                </div>
                
                <h3 class="producto-nombre">${producto.producto || 'Producto sin nombre'}</h3>
                
                <div class="card-footer">
                    <div class="precios">
                        <div class="precio-actual">${precioFinal.toLocaleString('es-CO')}</div>
                        ${mostrarPrecioAnterior ? `
                            <div class="precio-anterior">${precioOriginal.toLocaleString('es-CO')}</div>
                        ` : ''}
                        <div class="envio-gratis">Envío gratis</div>
                    </div>
                    
                    <span class="icono-ver">
                        <i class="bi bi-eye"></i>
                    </span>
                </div>
            </div>
        </a>
    </div>`;
    
    return cardHTML;
}

// ==============================================
// CATEGORÍAS RÁPIDAS SIMPLIFICADAS
// ==============================================

function inicializarCategoriasRapidas() {
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ No hay productos para categorías');
        return;
    }
    mostrarCategoriasNivel0();
}

function mostrarCategoriasNivel0() {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const tiposUnicos = ['TODOS', ...new Set(productosGlobal.map(p => p.tipo).filter(Boolean))];
    
    const html = tiposUnicos.map(tipo => {
        let contador = '';
        let icono = '🛍️';
        
        if (tipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
            icono = obtenerIcono(tipo, 0);
        }

        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
                   onclick="filtrarPorTipoDesdeCategoria('${tipo}'); return false;">
                    <div>${icono}</div>
                    <div>${tipo}</div>
                    ${contador}
                </a>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

// ==============================================
// FUNCIONES DE NAVEGACIÓN SIMPLIFICADAS
// ==============================================

function filtrarPorTipoDesdeCategoria(tipo) {
    console.log('🎯 Filtrando por tipo:', tipo);
    
    if (vistaActual === 'todos' || vistaActual === 'productos') {
        cargarPorTipo(tipo);
    } else {
        cambiarAVista('productos', false, true);
        setTimeout(() => {
            cargarPorTipo(tipo);
        }, 100);
    }
    
    return false;
}

async function cargarPorTipo(tipo) {
    console.log('📁 Cargando tipo:', tipo);
    
    if (tipo === 'TODOS') {
        cambiarAVista('todos', false, !esPrimeraCarga);
        await cargarVistaTodos();
        return;
    }

    cambiarAVista('productos', false, !esPrimeraCarga);
    
    document.getElementById('titulo-productos').textContent = `Productos de ${tipo}`;
    
    await cargarProductosPorTipo(tipo);
}

async function cargarProductosPorTipo(tipo) {
    try {
        let productosFiltrados = productosGlobal.filter(p => p.tipo === tipo);
        productosFiltrados = productosFiltrados.reverse();
        
        const contador = document.getElementById('contador-productos');
        const grid = document.getElementById('grid-productos');
        
        if (!grid || !contador) return;
        
        contador.textContent = `${productosFiltrados.length} productos`;
        
        if (productosFiltrados.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="mt-3">No se encontraron productos</h5>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = productosFiltrados.map(producto => crearCardProductoHTML(producto)).join('');
        
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// ==============================================
// VISTA "TODOS LOS PRODUCTOS"
// ==============================================

async function cargarVistaTodos() {
    try {
        const contador = document.getElementById('contador-todos');
        const grid = document.getElementById('grid-todos');
        
        if (!grid || !contador) return;
        
        productosCargados = 0;
        grid.innerHTML = '';
        
        contador.textContent = `0 de ${productosGlobal.length} productos`;
        
        if (productosGlobal.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="mt-3">No hay productos disponibles</h5>
                </div>
            `;
            return;
        }
        
        // Mostrar todos los productos de una vez
        productosGlobal.forEach(producto => {
            const cardHTML = crearCardProductoHTML(producto);
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        contador.textContent = `${productosGlobal.length} productos`;
        
    } catch (error) {
        console.error('Error cargando vista todos:', error);
    }
}

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

function volverAInicio() {
    console.log('🏠 Volviendo al inicio...');
    esPrimeraCarga = false;
    
    mostrarSeccionPresentacion(true);
    cambiarAVista('inicio', true);
    mostrarCategoriasNivel0();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================================
// INICIALIZACIÓN PRINCIPAL - SIMPLIFICADA
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Inicializando Anmago Store...');
    
    // 🔥 CONFIGURAR PROTECCIÓN PRIMERO
    configurarProteccionNavegacion();
    
    const { tipo, subtipo, categoria } = getParametrosDesdeURL();

    await cargarCatalogoGlobal();
    
    inicializarCategoriasRapidas();
    
    setTimeout(() => {
        if (tipo) {
            esPrimeraCarga = false;
            cargarPorTipo(tipo);
        } else {
            volverAInicio();
        }
    }, 500);
    
    // Hacer funciones globales
    window.mostrarCatalogoCompleto = function() {
        esPrimeraCarga = false;
        cargarPorTipo('TODOS');
    };
    
    window.volverAInicio = volverAInicio;
    window.cerrarMenu = function() {
        const offcanvas = bootstrap?.Offcanvas?.getInstance(document.getElementById('menuLateral'));
        if (offcanvas) offcanvas.hide();
    };
    
    console.log('✅ Anmago Store inicializada correctamente');
});
