// ==============================================
// ANMAGO STORE - APP.JS COMPLETO Y FUNCIONAL
// ==============================================

// Variables globales
let productosGlobal = [];
let vistaActual = 'inicio';
let contextoNavegacion = {
    nivel: 0, // 0: inicio, 1: tipo, 2: subtipo, 3: categoria
    tipo: null,
    subtipo: null,
    categoria: null
};
let productosCargados = 0;

// Iconos para categorías
const ICONOS_CATEGORIAS = {
    'TODOS': '🛍️',
    'ROPA': '👗',
    'RELOJERIA': '⌚',
    'HOGAR': '🏠',
    'BELLEZA': '💄',
    'NAVIDAD': '🎄',
    'ESCOLAR': '🎒',
    'DAMA': '👩',
    'CABALLERO': '👨',
    'UNISEX': '👥',
    'NIÑOS': '👦',
    'NIÑAS': '👧',
};

// Imágenes por subtipo
const IMAGENES_POR_SUBTIPO = {
    "dama": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20realista%20para%20.png?tr=w-300,q-80",
    "caballero": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20realista%20para%20h.png?tr=w-300,q-80",
    "unisex": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20estilizado%20parej.png?tr=w-300,q-80",
    "niños": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20realista%20para%20nño.png?tr=w-300,q-80",
    "niñas": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20realista%20para%20niña.png?tr=w-300,q-80",
    "hogar": "https://ik.imagekit.io/mbsk9dati/subtipos/ícono%20realista%20para%20hogar.png?tr=w-300,q-80",
    "iluminacion": "https://ik.imagekit.io/mbsk9dati/subtipos/%C3%ADcono%20realista%20de%20bo.png?tr=w-300,q-80",
    "analógico": "https://ik.imagekit.io/mbsk9dati/SUBTIPOS/reloj_analogico.jpg?tr=w-300,q-80",
    "smartwatch": "https://ik.imagekit.io/mbsk9dati/SUBTIPOS/smartwatch.jpg?tr=w-300,q-80",
    "cocina": "https://ik.imagekit.io/mbsk9dati/subtipos/%C3%ADcono%20realista%20de%20co.png?tr=w-300,q-80",
    "decoración": "https://ik.imagekit.io/mbsk9dati/SUBTIPOS/decoracion.jpg?tr=w-300,q-80",
    "maquillaje": "https://ik.imagekit.io/mbsk9dati/SUBTIPOS/maquillaje.jpg?tr=w-300,q-80",
    "cuidado facial": "https://ik.imagekit.io/mbsk9dati/SUBTIPOS/facial.jpg?tr=w-300,q-80",
    "baño": "https://ik.imagekit.io/mbsk9dati/subtipos/ba%C3%B1o.png?tr=w-300,q-80",
    "vehiculos": "https://ik.imagekit.io/mbsk9dati/subtipos/VEHICULO.png?tr=w-300,q-80",
    "habitacion": "https://ik.imagekit.io/mbsk9dati/subtipos/%C3%ADcono%20realista%20de%20ca.png?tr=w-300,q-80",
    "salud": "https://ik.imagekit.io/mbsk9dati/subtipos/SALUD.png?tr=w-300,q-80",
    "mascotas": "https://ik.imagekit.io/mbsk9dati/subtipos/mascotas.png"
};

// ==============================================
// FUNCIONES BÁSICAS
// ==============================================

// Obtener parámetros desde URL
function getParametrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        tipo: params.get("tipo")?.trim(),
        subtipo: params.get("subtipo")?.trim(),
        categoria: params.get("categoria")?.trim(),
        vista: params.get("vista")?.trim()
    };
}

// Función para obtener icono
function obtenerIcono(categoria, nivel = 0) {
    if (nivel === 2) return ''; // Sin icono para categorías
    return ICONOS_CATEGORIAS[categoria] || '📦';
}

// Cambiar vista
function cambiarAVista(vistaNombre) {
    console.log('📱 Cambiando a vista:', vistaNombre);
    
    // Ocultar todas las vistas
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    // Mostrar la vista solicitada
    const vistaElement = document.getElementById(`vista-${vistaNombre}`);
    if (vistaElement) {
        vistaElement.classList.add('vista-activa');
    }
    
    vistaActual = vistaNombre;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cargar catálogo global
async function cargarCatalogoGlobal() {
    try {
        console.log('📦 Cargando catálogo...');
        const url = "https://raw.githubusercontent.com/anmagoS/anmago.store/main/catalogo.json";
        const res = await fetch(url);
        const productos = await res.json();
        
        window.catalogoGlobal = productos;
        productosGlobal = productos;
        
        console.log(`✅ ${productos.length} productos cargados`);
        return productos;
    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        return [];
    }
}

// ==============================================
// FUNCIONES PARA SISTEMA DE PROMOCIONES SINCRONIZADO
// ==============================================

// 1. FUNCIÓN GLOBAL PARA OBTENER PRODUCTOS EN PROMOCIÓN
function obtenerProductosEnPromocion() {
    if (!productosGlobal || productosGlobal.length === 0) {
        return [];
    }
    
    // Filtrar productos con promoción activa
    return productosGlobal.filter(producto => {
        const promo = producto.promo;
        const tienePromo = promo === "sí" || 
                          promo === true || 
                          promo === "true" ||
                          (producto.precioOferta && producto.precioOferta < producto.precio);
        
        return tienePromo && producto.imagen && producto.producto;
    });
}

// 2. FUNCIÓN RENOMBRADA PARA EVITAR CONFLICTO CON PROMOS.HTML
function APP_obtenerProductosDelBloqueActual(cantidad = 8) {
    const productosPromo = obtenerProductosEnPromocion();
    
    if (productosPromo.length === 0) {
        return [];
    }
    
    // USAR EXACTAMENTE LA MISMA LÓGICA QUE PROMOS.HTML
    const ahora = new Date();
    const horas = ahora.getHours();
    const bloque = Math.floor(horas / 6); // 0-3 (4 bloques por día, 6 horas cada uno)
    const productosPorBloque = 8; // IGUAL QUE PROMOS.HTML
    
    // Calcular el índice de inicio exactamente igual
    const indiceInicio = (bloque * productosPorBloque) % productosPromo.length;
    
    // Obtener productos del bloque actual
    const productosBloque = [];
    for (let i = 0; i < Math.min(productosPorBloque, productosPromo.length); i++) {
        const indice = (indiceInicio + i) % productosPromo.length;
        productosBloque.push(productosPromo[indice]);
    }
    
    console.log(`📊 APP - Bloque ${bloque + 1}: Mostrando ${productosBloque.length} productos (índice ${indiceInicio})`);
    console.log(`📊 APP - Total productos en promoción: ${productosPromo.length}`);
    
    return productosBloque;
}

// 3. FUNCIÓN PARA CARGAR CARRUSEL SINCRONIZADO CON PROMOS.HTML
async function cargarCarruselPromos() {
    try {
        console.log('🔄 Cargando carrusel de promociones...');
        
        // Obtener los 8 productos del bloque actual (SINCRONIZADO)
        const productosParaCarrusel = APP_obtenerProductosDelBloqueActual(8);
        
        if (productosParaCarrusel.length === 0) {
            console.log('⚠️ No hay productos en promoción para carrusel');
            
            // Mostrar productos destacados como respaldo
            const productosDestacados = productosGlobal
                .filter(p => p.imagen && p.producto)
                .slice(-6)
                .reverse();
            
            actualizarCarrusel(productosDestacados);
            return;
        }
        
        console.log(`🎯 Carrusel - ${productosParaCarrusel.length} productos sincronizados con PROMOS.HTML`);
        
        // Mostrar solo 6 productos en el carrusel (ajustar según diseño)
        const productosMostrar = productosParaCarrusel.slice(0, 6);
        actualizarCarrusel(productosMostrar);
        
        // Iniciar temporizador de sincronización
        iniciarSincronizacionPromos();
        
    } catch (error) {
        console.error('❌ Error cargando carrusel de promociones:', error);
        
        const carouselContent = document.getElementById('carousel-promos-home-contenido');
        if (carouselContent) {
            carouselContent.innerHTML = `
                <div class="carousel-item active">
                    <div class="text-center py-4">
                        <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
                        <p class="mt-2">Error cargando promociones</p>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="cargarCarruselPromos()">
                            Reintentar
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// 4. FUNCIÓN PARA INICIAR SINCRONIZACIÓN AUTOMÁTICA
function iniciarSincronizacionPromos() {
    // Calcular tiempo hasta el siguiente cambio de bloque (cada 6 horas)
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();
    
    // Calcular segundos hasta el próximo bloque
    const horasRestantes = 5 - (horas % 6);
    const minutosRestantes = 59 - minutos;
    const segundosRestantes = 59 - segundos;
    
    const totalSegundos = (horasRestantes * 3600) + (minutosRestantes * 60) + segundosRestantes + 1;
    
    console.log(`⏰ Sincronización - Próximo cambio en ${horasRestantes}h ${minutosRestantes}m ${segundosRestantes}s`);
    
    // Programar recarga para el próximo cambio de bloque
    setTimeout(() => {
        console.log('🔄 Recargando carrusel por cambio de bloque...');
        cargarCarruselPromos();
        
        // Configurar intervalo para siguientes cambios (cada 6 horas)
        setInterval(() => {
            console.log('🔄 Recargando carrusel automáticamente (cada 6 horas)...');
            cargarCarruselPromos();
        }, 6 * 60 * 60 * 1000); // 6 horas
    }, totalSegundos * 1000);
}

// 5. FUNCIÓN PARA ACTUALIZAR EL CARRUSEL (CORREGIDA - SIN JQUERY)
function actualizarCarrusel(productos) {
    const carouselContent = document.getElementById('carousel-promos-home-contenido');
    if (!carouselContent) {
        console.log('⚠️ No se encontró el contenedor del carrusel');
        return;
    }
    
    if (!productos || productos.length === 0) {
        carouselContent.innerHTML = `
            <div class="carousel-item active">
                <div class="text-center py-4">
                    <i class="bi bi-tag text-muted fs-1"></i>
                    <p class="mt-2">No hay promociones activas</p>
                    <p class="small text-muted">Vuelve más tarde para ver ofertas</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Crear items del carrusel
    const itemsHTML = productos.map((producto, index) => {
        const precioOriginal = Number(producto.precio) || 0;
        const precioOferta = producto.precioOferta || Math.round(precioOriginal * 0.9);
        const descuento = Math.round((1 - precioOferta / precioOriginal) * 100);
        
        // Obtener imagen correcta
        let imagenMostrar = '';
        if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
            const imagenPrincipal = producto.imagenes.find(img => 
                img.tipo && img.tipo.toUpperCase() === "PRINCIPAL"
            );
            
            if (imagenPrincipal) {
                imagenMostrar = imagenPrincipal.url;
            } else {
                const imagenVariante = producto.imagenes.find(img => 
                    img.tipo && img.tipo.toUpperCase() === "VARIANTE"
                );
                imagenMostrar = imagenVariante ? imagenVariante.url : producto.imagenes[0].url;
            }
        } else {
            imagenMostrar = producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
        }
        
        return `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <div class="producto-carrusel-card">
                    <a href="PRODUCTO.HTML?id=${producto.id}">
                        <img src="${imagenMostrar}" 
                             alt="${producto.producto || 'Producto en oferta'}" 
                             class="producto-carrusel-img"
                             loading="lazy"
                             onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                        
                        <div class="producto-carrusel-info">
                            <div class="d-flex flex-wrap gap-1 mb-2">
                                <span class="badge bg-danger small">-${descuento}%</span>
                                ${producto.tipo ? `<span class="badge bg-info text-dark small">${producto.tipo}</span>` : ''}
                            </div>
                            
                            <h3 class="producto-carrusel-nombre">${producto.producto || 'Oferta especial'}</h3>
                            
                            <div class="mt-2">
                                <div class="producto-carrusel-precio">
                                    $${precioOferta.toLocaleString('es-CO')}
                                </div>
                                <div class="text-muted text-decoration-line-through small">
                                    $${precioOriginal.toLocaleString('es-CO')}
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-primary w-100" 
                                        onclick="event.preventDefault(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                                    Ver producto
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    carouselContent.innerHTML = itemsHTML;
    
    // Inicializar carrusel usando Bootstrap nativo (sin jQuery)
    const carouselElement = document.getElementById('carousel-promos-home');
    if (carouselElement && typeof bootstrap !== 'undefined') {
        // Si Bootstrap 5 está disponible, inicializar el carrusel
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: 5000, // Cambiar cada 5 segundos
            wrap: true
        });
        console.log('✅ Carrusel inicializado con Bootstrap 5');
    } else {
        // Si no hay Bootstrap 5, usar un método simple
        inicializarCarruselSimple();
    }
    
    console.log(`✅ Carrusel actualizado con ${productos.length} productos`);
}

// 6. FUNCIÓN SIMPLE PARA INICIALIZAR CARRUSEL SIN BOOTSTRAP
function inicializarCarruselSimple() {
    const carousel = document.getElementById('carousel-promos-home');
    if (!carousel) return;
    
    let currentIndex = 0;
    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    // Función para cambiar al siguiente slide
    function nextSlide() {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add('active');
    }
    
    // Iniciar rotación automática cada 5 segundos
    setInterval(nextSlide, 5000);
    console.log('✅ Carrusel inicializado con método simple');
}

// 7. TEMPORIZADOR DE PROMOCIONES (SINCRONIZADO)
function mostrarTemporizadorPromos() {
    const contenedor = document.getElementById("temporizador-home");
    if (!contenedor) return;

    const actualizar = () => {
        const ahora = new Date();
        const horas = ahora.getHours();
        const siguienteCorte = Math.ceil(horas / 6) * 6;
        const siguienteFecha = new Date(ahora);
        siguienteFecha.setHours(siguienteCorte, 0, 0, 0);

        const restante = siguienteFecha - ahora;
        if (restante <= 0) {
            contenedor.textContent = "⏳ ¡Promociones actualizadas!";
            
            // Recargar carrusel cuando cambia el bloque
            setTimeout(() => cargarCarruselPromos(), 1000);
            return;
        }

        const horasRestantes = Math.floor(restante / (1000 * 60 * 60));
        const minutosRestantes = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
        const segundosRestantes = Math.floor((restante % (1000 * 60)) / 1000);

        contenedor.textContent = `⏰ Cambia en ${horasRestantes}h ${minutosRestantes}m ${segundosRestantes}s`;
    };

    actualizar();
    setInterval(actualizar, 1000);
}

// 8. FUNCIÓN PARA VERIFICAR SINCRONIZACIÓN
function verificarSincronizacionPromos() {
    console.log('🔍 Verificando sincronización de promociones...');
    
    const productosPromo = obtenerProductosEnPromocion();
    const productosBloque = APP_obtenerProductosDelBloqueActual(8);
    
    console.log(`📊 Total productos en promoción: ${productosPromo.length}`);
    console.log(`📊 Productos en bloque actual: ${productosBloque.length}`);
    
    if (productosBloque.length > 0) {
        console.log('📋 Productos actuales en carrusel:');
        productosBloque.forEach((p, i) => {
            console.log(`   ${i+1}. ${p.producto} (ID: ${p.id})`);
        });
    }
    
    return {
        totalPromociones: productosPromo.length,
        productosBloqueActual: productosBloque.length,
        sincronizado: productosBloque.length > 0
    };
}

// ==============================================
// FUNCIÓN PARA CARGAR ÚLTIMOS PRODUCTOS (CORREGIDA)
// ==============================================

async function cargarUltimosProductos() {
    try {
        if (productosGlobal.length === 0) {
            console.log('⚠️ No hay productos globales cargados');
            return;
        }
        
        // Obtener los últimos 30 productos del catálogo
        const ultimosProductos = productosGlobal
            .filter(p => p.imagen && p.producto)
            .slice(-30)
            .reverse();
        
        console.log(`📦 Últimos productos: ${ultimosProductos.length} de ${productosGlobal.length} totales`);
        
        const grid = document.getElementById('grid-ultimos');
        if (!grid) return;
        
        if (ultimosProductos.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-3">
                    <i class="bi bi-emoji-frown text-muted fs-1"></i>
                    <p class="mt-2 text-muted">No hay productos recientes</p>
                </div>
            `;
            return;
        }
        
        // 🎯 CORRECCIÓN: Usar join('') con strings HTML
        grid.innerHTML = ultimosProductos.map(producto => crearCardProductoHTML(producto)).join('');
        
        console.log(`✅ ${ultimosProductos.length} últimos productos cargados`);
        
    } catch (error) {
        console.error('❌ Error cargando últimos productos:', error);
        const grid = document.getElementById('grid-ultimos');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-3">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Error al cargar productos recientes</p>
                    </div>
                </div>
            `;
        }
    }
}

// ==============================================
// FUNCIÓN PARA CREAR CARD DE PRODUCTO (STRING HTML)
// ==============================================

function crearCardProductoHTML(producto) {
    const precioOriginal = Number(producto.precio) || 0;
    let precioFinal = precioOriginal;
    let badgePromo = '';
    
    // Verificar promoción
    const estaEnPromo = producto.promo === "sí" || producto.promo === true || producto.promo === "true";
    
    if (estaEnPromo) {
        const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / precioOriginal) * 100) : 10;
        precioFinal = producto.precioOferta || Math.round(precioOriginal * 0.9);
        badgePromo = `<span class="badge bg-danger position-absolute" style="top: 10px; left: 10px;">-${descuento}%</span>`;
    }
    
    // Verificar stock
    const badgeStock = producto.stock <= 5 ? 
        `<span class="badge bg-warning text-dark position-absolute" style="top: 10px; right: 10px;">Últimas</span>` : '';
    
    // Obtener imagen correcta
    let imagenMostrar = '';
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        const imagenPrincipal = producto.imagenes.find(img => 
            img.tipo && img.tipo.toUpperCase() === "PRINCIPAL"
        );
        
        if (imagenPrincipal) {
            imagenMostrar = imagenPrincipal.url;
        } else {
            const imagenVariante = producto.imagenes.find(img => 
                img.tipo && img.tipo.toUpperCase() === "VARIANTE"
            );
            imagenMostrar = imagenVariante ? imagenVariante.url : producto.imagenes[0].url;
        }
    } else {
        imagenMostrar = producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
    }
    
    // 🎯 RETORNAR STRING HTML, NO ELEMENTO DOM
    return `
        <div class="card-producto-ml">
            <a href="PRODUCTO.HTML?id=${producto.id}">
                <div class="position-relative">
                    <img src="${imagenMostrar}" 
                         alt="${producto.producto}" 
                         class="card-img-ml"
                         loading="lazy"
                         onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                    ${badgePromo}
                    ${badgeStock}
                </div>
                
                <div class="card-body-ml">
                    <div class="d-flex flex-wrap gap-1 mb-1">
                        <span class="badge bg-info text-dark small">${producto.tipo || ''}</span>
                        <span class="badge bg-secondary small">${producto.subtipo || ''}</span>
                    </div>
                    
                    <h3 class="nombre-producto-ml small line-clamp-2">${producto.producto}</h3>
                    
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <div class="precio-ml fw-bold text-primary">
                                $${precioFinal.toLocaleString('es-CO')}
                            </div>
                            ${estaEnPromo && precioOriginal !== precioFinal ? `
                                <div class="text-muted text-decoration-line-through small">
                                    $${precioOriginal.toLocaleString('es-CO')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="event.preventDefault(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// ==============================================
// CATEGORÍAS RÁPIDAS DINÁMICAS
// ==============================================

// Inicializar categorías rápidas
function inicializarCategoriasRapidas() {
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ No hay productos para inicializar categorías');
        return;
    }

    mostrarCategoriasNivel0();
}

// Mostrar nivel 0: Tipos principales
function mostrarCategoriasNivel0() {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const tiposUnicos = ['TODOS', ...new Set(productosGlobal.map(p => p.tipo).filter(Boolean))];
    
    const html = tiposUnicos.map(tipo => {
        let contador = '';
        if (tipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
               onclick="cargarPorTipo('${tipo}'); return false;">
                <div>${obtenerIcono(tipo, 0)}</div>
                <div>${tipo}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
}

// Mostrar nivel 1: Subtipos
function mostrarCategoriasNivel1(tipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const subtiposUnicos = ['TODOS', ...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo)
            .map(p => p.subtipo)
            .filter(Boolean)
    )];

    const html = subtiposUnicos.map(subtipo => {
        let contador = '';
        if (subtipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo && p.subtipo === subtipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
               onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
                <div>${obtenerIcono(subtipo, 1)}</div>
                <div>${subtipo}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
}

// Mostrar nivel 2: Categorías
function mostrarCategoriasNivel2(tipo, subtipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const categoriasUnicas = ['TODAS', ...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo === subtipo)
            .map(p => p.categoria)
            .filter(Boolean)
    )];

    const html = categoriasUnicas.map(categoria => {
        let contador = '';
        if (categoria !== 'TODAS') {
            const count = productosGlobal.filter(p => 
                p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
            ).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida sin-icono" data-categoria="${categoria}" 
               onclick="cargarPorCategoria('${tipo}', '${subtipo}', '${categoria}'); return false;">
                <div>${categoria}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
}

// ==============================================
// FUNCIONES DE NAVEGACIÓN
// ==============================================

// Cargar por tipo
// Cargar por tipo - MODIFICADA para mostrar productos directamente
async function cargarPorTipo(tipo) {
    console.log('📁 Cargando tipo:', tipo);
    
    if (tipo === 'TODOS') {
        cambiarAVista('todos');
        await cargarVistaTodos();
        mostrarCategoriasNivel0();
        return;
    }

    // CAMBIAR de 'subtipos' a 'productos'
    cambiarAVista('productos');
    
    // Actualizar breadcrumbs y título
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = 'Todos';
    document.getElementById('breadcrumb-subtipo-link').onclick = null;
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${tipo}`;
    
    // Cargar TODOS los productos de este tipo (sin filtrar subtipo ni categoría)
    await cargarProductosPorTipo(tipo);
    mostrarCategoriasNivel1(tipo);
}

// Cargar por subtipo - MODIFICADA para mostrar productos directamente
async function cargarPorSubtipo(tipo, subtipo) {
    console.log('📁 Cargando subtipo:', subtipo);
    
    if (subtipo === 'TODOS') {
        await cargarPorTipo(tipo);
        return;
    }

    // CAMBIAR de 'categorias' a 'productos'
    cambiarAVista('productos');
    
    // Actualizar breadcrumbs y título
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${subtipo}`;
    
    // Cargar TODOS los productos de este subtipo (sin filtrar categoría)
    await cargarProductosPorSubtipo(tipo, subtipo);
    mostrarCategoriasNivel2(tipo, subtipo);
}

// Cargar por categoría
async function cargarPorCategoria(tipo, subtipo, categoria) {
    console.log('📁 Cargando categoría:', categoria);
    
    if (categoria === 'TODAS') {
        await cargarPorSubtipo(tipo, subtipo);
        return;
    }

    cambiarAVista('productos');
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = categoria;
    document.getElementById('titulo-productos').textContent = categoria;
    
    await cargarProductosDesdeCatalogo(tipo, subtipo, categoria);
    mostrarCategoriasNivel2(tipo, subtipo);
}

// ==============================================
// FUNCIONES DE CARGA DE CONTENIDO
// ==============================================

// Cargar subtipos desde catálogo
async function cargarSubtiposDesdeCatalogo(tipo) {
    try {
        const subtipos = [...new Set(
            productosGlobal
                .filter(p => p.tipo === tipo)
                .map(p => p.subtipo)
                .filter(Boolean)
        )];
        
        const grid = document.getElementById('grid-subtipos');
        if (!grid) return;
        
        grid.innerHTML = subtipos.map(subtipo => {
            const count = productosGlobal.filter(p => p.tipo === tipo && p.subtipo === subtipo).length;
            const imagen = IMAGENES_POR_SUBTIPO[subtipo.toLowerCase()] || 
                          "https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg";
            
            return `
                <div class="card-producto-ml">
                    <a href="#" onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
                        <img src="${imagen}" 
                             alt="${subtipo}" 
                             class="card-img-ml"
                             loading="lazy"
                             onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                        <div class="card-body-ml">
                            <h3 class="nombre-producto-ml small">${subtipo}</h3>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <span class="badge bg-secondary small">${count} productos</span>
                                <button class="btn btn-sm btn-outline-primary">
                                    Ver <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error cargando subtipos:', error);
    }
}

// Cargar categorías desde catálogo
async function cargarCategoriasDesdeCatalogo(tipo, subtipo) {
    try {
        const categorias = [...new Set(
            productosGlobal
                .filter(p => p.tipo === tipo && p.subtipo === subtipo)
                .map(p => p.categoria)
                .filter(Boolean)
        )];
        
        const grid = document.getElementById('grid-categorias');
        if (!grid) return;
        
        grid.innerHTML = categorias.map(categoria => {
            const productosCategoria = productosGlobal.filter(p => 
                p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
            );
            
            const imagen = productosCategoria[0]?.imagen || 
                          "https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg";
            
            return `
                <div class="card-producto-ml">
                    <a href="#" onclick="cargarPorCategoria('${tipo}', '${subtipo}', '${categoria}'); return false;">
                        <img src="${imagen}" 
                             alt="${categoria}" 
                             class="card-img-ml"
                             loading="lazy"
                             onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                        <div class="card-body-ml">
                            <h3 class="nombre-producto-ml small">${categoria}</h3>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <span class="badge bg-secondary small">${productosCategoria.length} productos</span>
                                <button class="btn btn-sm btn-outline-primary">
                                    Ver <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// Cargar productos desde catálogo
async function cargarProductosDesdeCatalogo(tipo, subtipo, categoria) {
    try {
        const productosFiltrados = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
        );

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
        const grid = document.getElementById('grid-productos');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Error al cargar productos</p>
                    </div>
                </div>
            `;
        }
    }
}
// NUEVA: Cargar productos por tipo (sin subtipo ni categoría)
async function cargarProductosPorTipo(tipo) {
    try {
        const productosFiltrados = productosGlobal.filter(p => 
            p.tipo === tipo
        );

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
        console.error('Error cargando productos por tipo:', error);
        const grid = document.getElementById('grid-productos');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Error al cargar productos</p>
                    </div>
                </div>
            `;
        }
    }
}

// NUEVA: Cargar productos por subtipo (sin categoría)
async function cargarProductosPorSubtipo(tipo, subtipo) {
    try {
        const productosFiltrados = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo
        );

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
        console.error('Error cargando productos por subtipo:', error);
        const grid = document.getElementById('grid-productos');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Error al cargar productos</p>
                    </div>
                </div>
            `;
        }
    }
}
// ==============================================
// VISTA "TODOS LOS PRODUCTOS"
// ==============================================

// Cargar vista de todos los productos
async function cargarVistaTodos() {
    try {
        const contador = document.getElementById('contador-todos');
        const grid = document.getElementById('grid-todos');
        
        if (!grid || !contador) return;
        
        contador.textContent = `${productosGlobal.length} productos`;
        productosCargados = 0;
        
        if (productosGlobal.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="mt-3">No hay productos disponibles</h5>
                </div>
            `;
            return;
        }
        
        cargarMasProductos();
        
    } catch (error) {
        console.error('Error cargando vista todos:', error);
    }
}

// Cargar más productos
function cargarMasProductos() {
    const grid = document.getElementById('grid-todos');
    const btnContainer = document.getElementById('btn-ver-mas-container');
    
    if (!grid) return;
    
    const inicio = productosCargados;
    const fin = inicio + 20;
    const productosParaMostrar = productosGlobal.slice(inicio, fin);
    
    if (productosParaMostrar.length === 0) {
        if (btnContainer) {
            btnContainer.innerHTML = `
                <div class="alert alert-info py-2">
                    <i class="bi bi-check-circle"></i> Todos los productos cargados
                </div>
            `;
        }
        return;
    }
    
    // Agregar nuevos productos
    productosParaMostrar.forEach(producto => {
        const cardHTML = crearCardProductoHTML(producto);
        grid.innerHTML += cardHTML;
    });
    
    productosCargados += productosParaMostrar.length;
    
    // Actualizar botón
    if (btnContainer) {
        if (productosCargados < productosGlobal.length) {
            btnContainer.innerHTML = `
                <button id="btn-ver-mas" class="btn btn-outline-primary" onclick="cargarMasProductos()">
                    <i class="bi bi-arrow-down"></i> Ver más productos (${productosGlobal.length - productosCargados} restantes)
                </button>
            `;
        } else {
            btnContainer.innerHTML = `
                <div class="alert alert-info py-2">
                    <i class="bi bi-check-circle"></i> Todos los productos cargados
                </div>
            `;
        }
    }
}

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

// Volver al inicio
function volverAInicio() {
    console.log('🏠 Volviendo al inicio...');
    cambiarAVista('inicio');
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
    mostrarCategoriasNivel0();
    
    const nuevaURL = new URL(window.location);
    nuevaURL.searchParams.delete('vista');
    nuevaURL.searchParams.delete('tipo');
    nuevaURL.searchParams.delete('subtipo');
    nuevaURL.searchParams.delete('categoria');
    window.history.replaceState({}, '', nuevaURL);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Configurar instalación PWA
function configurarInstalacionPWA() {
    const esPWAInstalado = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;

    if (!esPWAInstalado) {
        const contenedor = document.getElementById("instalar-container");
        if (contenedor) contenedor.classList.remove("d-none");
    }

    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;

        const boton = document.getElementById("boton-instalar");
        boton?.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const resultado = await deferredPrompt.userChoice;
                deferredPrompt = null;
                document.getElementById("instalar-container")?.classList.add("d-none");
            }
        });
    });
}

// ==============================================
// INICIALIZACIÓN PRINCIPAL
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Inicializando Anmago Store...');
    
    const { tipo, subtipo, categoria, vista } = getParametrosDesdeURL();

    // 1. Cargar catálogo global
    await cargarCatalogoGlobal();
    
    // 2. Inicializar categorías rápidas
    inicializarCategoriasRapidas();
    
    // 3. Configurar PWA
    configurarInstalacionPWA();
    
    // 4. Cargar carrusel de promociones (SINCRONIZADO)
    setTimeout(() => {
        cargarCarruselPromos();
    }, 1000);
    
    // 5. Cargar header dinámicamente
    const headerContainer = document.getElementById("header-container");
    if (headerContainer && !headerContainer.querySelector(".header-sticky")) {
        try {
            const header = await fetch("HEADER.HTML").then(res => res.text());
            headerContainer.insertAdjacentHTML("afterbegin", header);
        } catch (error) {
            console.error("❌ Error cargando header:", error);
        }
    }
    
    // 6. Activar buscador si existe
    if (typeof activarBuscadorGlobal === "function") {
        activarBuscadorGlobal();
    }
    
    // 7. Cargar últimos productos
    setTimeout(() => {
        cargarUltimosProductos();
    }, 1500);
    
    // 8. Mostrar temporizador de promociones (SINCRONIZADO)
    setTimeout(() => {
        mostrarTemporizadorPromos();
    }, 2000);
    
    // 9. Manejar navegación desde URL
    setTimeout(() => {
        if (tipo && subtipo && categoria) {
            cargarPorCategoria(tipo, subtipo, categoria);
        } else if (tipo && subtipo) {
            cargarPorSubtipo(tipo, subtipo);
        } else if (tipo) {
            cargarPorTipo(tipo);
        } else if (vista === 'todos') {
            cargarPorTipo('TODOS');
        } else if (vista === 'productos' || vista === 'categorias' || vista === 'subtipos') {
            cambiarAVista(vista);
        }
    }, 2000);
    
    // 10. Actualizar carrito
    if (typeof window.actualizarContadorCarrito === "function") {
        setTimeout(() => {
            window.actualizarContadorCarrito();
        }, 2500);
    }
    
    // 11. Verificar sincronización de promociones
    setTimeout(() => {
        const estado = verificarSincronizacionPromos();
        console.log('✅ Sistema de promociones sincronizado:', estado.sincronizado);
    }, 3000);
    
    console.log('✅ Anmago Store inicializada correctamente');
});

// ==============================================
// FUNCIONES DE COMPATIBILIDAD
// ==============================================

// Mantener función para compatibilidad
function mostrarTodosLosProductos() {
    cargarPorTipo('TODOS');
}

// Función de compatibilidad
function cargarSubtipos(tipo) {
    cargarPorTipo(tipo);
}

// Función de compatibilidad
function filtrarPorCategoria(categoria) {
    if (categoria === 'TODOS') {
        volverAInicio();
        return;
    }
    
    const productoEjemplo = productosGlobal.find(p => 
        p.tipo === categoria || p.subtipo === categoria || p.categoria === categoria
    );
    
    if (productoEjemplo) {
        if (productoEjemplo.tipo === categoria) {
            cargarPorTipo(categoria);
        } else if (productoEjemplo.subtipo === categoria) {
            const tipoProducto = productosGlobal.find(p => p.subtipo === categoria)?.tipo;
            if (tipoProducto) {
                cargarPorSubtipo(tipoProducto, categoria);
            }
        } else {
            const productoCat = productosGlobal.find(p => p.categoria === categoria);
            if (productoCat) {
                cargarPorCategoria(productoCat.tipo, productoCat.subtipo, categoria);
            }
        }
    }
}

// Función de compatibilidad para tu header
function mostrarTodosLosProductosCompleto() {
    cargarPorTipo('TODOS');
}

// ==============================================
// FUNCIÓN DE DEPURACIÓN PARA VERIFICAR SINCRONIZACIÓN
// ==============================================

function depurarSincronizacionPromos() {
    console.log('🔧 DEPURACIÓN - SISTEMA DE PROMOCIONES');
    console.log('=====================================');
    
    // 1. Verificar productos globales
    console.log(`📦 Productos globales cargados: ${productosGlobal.length}`);
    
    // 2. Verificar productos en promoción
    const productosPromo = obtenerProductosEnPromocion();
    console.log(`🎯 Productos en promoción: ${productosPromo.length}`);
    
    // 3. Verificar bloque actual
    const ahora = new Date();
    const horas = ahora.getHours();
    const bloque = Math.floor(horas / 6);
    console.log(`🕐 Hora actual: ${horas}:00`);
    console.log(`📊 Bloque actual: ${bloque + 1} (de 4)`);
    
    // 4. Verificar productos del bloque actual
    const productosBloque = APP_obtenerProductosDelBloqueActual(8);
    console.log(`📋 Productos en bloque actual: ${productosBloque.length}`);
    
    // 5. Mostrar detalles de productos
    if (productosBloque.length > 0) {
        console.log('📝 Detalles de productos en carrusel:');
        productosBloque.forEach((p, i) => {
            console.log(`   ${i+1}. ${p.producto} (ID: ${p.id})`);
        });
    }
    
    console.log('=====================================');
    console.log('✅ Ejecuta en consola: cargarCarruselPromos() para recargar');
}

// ==============================================
// FUNCIÓN PARA FORZAR RECARGA DE PROMOCIONES
// ==============================================

function recargarPromociones() {
    console.log('🔄 Forzando recarga de promociones...');
    cargarCarruselPromos();
    mostrarTemporizadorPromos();
    console.log('✅ Promociones recargadas');
}

// ==============================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ==============================================

// Exportar funciones para que estén disponibles globalmente
window.APP_obtenerProductosDelBloqueActual = APP_obtenerProductosDelBloqueActual;
window.cargarCarruselPromos = cargarCarruselPromos;
window.verificarSincronizacionPromos = verificarSincronizacionPromos;
window.depurarSincronizacionPromos = depurarSincronizacionPromos;
window.recargarPromociones = recargarPromociones;
