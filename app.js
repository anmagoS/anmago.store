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
                contador = `<span class="badge-categoria-count"></span>`;
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

    // SOLO subtipos que existen (sin 'TODOS')
    const subtiposUnicos = [...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo)
            .map(p => p.subtipo)
            .filter(Boolean)
    )];

    // Si no hay subtipos, mostrar mensaje
    if (subtiposUnicos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-2">
                No hay subtipos disponibles
            </div>
        `;
        contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
        return;
    }

    const html = subtiposUnicos.map(subtipo => {
        return `
            <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
               onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
                <div>${obtenerIcono(subtipo, 1)}</div>
                <div>${subtipo}</div>
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

    // SOLO categorías que existen (sin 'TODAS')
    const categoriasUnicas = [...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo === subtipo && p.categoria)
            .map(p => p.categoria)
            .filter(Boolean)
    )];

    // Si no hay categorías, mostrar mensaje
    if (categoriasUnicas.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-2">
                No hay categorías disponibles
            </div>
        `;
        contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
        return;
    }

    const html = categoriasUnicas.map(categoria => {
        // Contar productos por categoría
        const count = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
        ).length;
        
        // Solo mostrar contador si hay productos
        const contador = count > 0 ? `<span class="badge-categoria-count"></span>` : '';

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
    console.log('✅ Catálogo cargado. Productos:', productosGlobal.length); // ← Agrega esto
    
    // 2. Inicializar categorías rápidas
    inicializarCategoriasRapidas();
    
    // 3. Configurar PWA
    configurarInstalacionPWA();
    
    
    
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
<!-- Botón para ver más -->
<div id="btn-ver-mas-container" class="text-center mt-3 d-none">
  <button id="btn-ver-mas" class="btn btn-outline-primary">
    <i class="bi bi-arrow-down"></i> Ver más productos
  </button>
</div>
// ==============================================
// ARREGLO DE EMERGENCIA PARA CATEGORÍAS
// ==============================================

// Función para forzar la carga de categorías
function forzarCargaCategorias() {
    console.log('🔄 Forzando carga de categorías...');
    
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor de categorías');
        return;
    }
    
    // Verificar si productosGlobal está cargado
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ productosGlobal está vacío, intentando recargar...');
        
        // Mostrar mensaje temporal
        contenedor.innerHTML = `
            <div class="text-center py-2">
                <div class="spinner-border spinner-border-sm text-primary"></div>
                <small class="text-muted ms-2">Cargando catálogo...</small>
            </div>
        `;
        
        // Intentar recargar el catálogo
        setTimeout(async () => {
            await cargarCatalogoGlobal();
            inicializarCategoriasRapidas();
        }, 1000);
        
        return;
    }
    
    // Si ya hay productos, inicializar categorías
    inicializarCategoriasRapidas();
}

// Sobrescribir la función original para asegurar que funcione
window.inicializarCategoriasRapidas = function() {
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ productosGlobal vacío en inicializarCategoriasRapidas');
        
        // Crear categorías de emergencia
        const contenedor = document.getElementById('categorias-rapidas');
        if (contenedor) {
            contenedor.innerHTML = `
                <a href="#" class="categoria-rapida" onclick="cargarPorTipo('TODOS'); return false;">
                    <div>🛍️</div>
                    <div>TODOS</div>
                </a>
                <a href="#" class="categoria-rapida" onclick="cargarPorTipo('ROPA'); return false;">
                    <div>👗</div>
                    <div>ROPA</div>
                </a>
                <a href="#" class="categoria-rapida" onclick="cargarPorTipo('RELOJERIA'); return false;">
                    <div>⌚</div>
                    <div>RELOJERIA</div>
                </a>
                <a href="#" class="categoria-rapida" onclick="cargarPorTipo('HOGAR'); return false;">
                    <div>🏠</div>
                    <div>HOGAR</div>
                </a>
                <a href="#" class="categoria-rapida" onclick="cargarPorTipo('BELLEZA'); return false;">
                    <div>💄</div>
                    <div>BELLEZA</div>
                </a>
            `;
        }
        return;
    }
    
    // Llamar a la función original (mostrarCategoriasNivel0)
    mostrarCategoriasNivel0();
};

// Ejecutar después de que todo cargue
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco más para asegurar que todo esté listo
    setTimeout(() => {
        forzarCargaCategorias();
    }, 2000);
    
    // También ejecutar cuando se haga clic en el logo
    document.querySelector('.logo a')?.addEventListener('click', function() {
        setTimeout(() => {
            forzarCargaCategorias();
        }, 500);
    });
});

// Depuración: verificar el estado
console.log('🔄 Script de emergencia cargado');
