// ==============================================
// ANMAGO STORE - APP.JS COMPLETO CORREGIDO
// VERSIÓN: CATEGORÍAS COMO FILTROS - SIN SCROLL AUTOMÁTICO
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
// FUNCIONES PARA ENLACES COMPARTIBLES
// ==============================================

function crearEnlaceFiltro(tipo = null, subtipo = null, categoria = null) {
    const url = new URL(window.location.origin + window.location.pathname);
    
    if (tipo) url.searchParams.set('tipo', tipo);
    if (subtipo) url.searchParams.set('subtipo', subtipo);
    if (categoria) url.searchParams.set('categoria', categoria);
    
    return url.toString();
}

function actualizarURLNavegacion(tipo = null, subtipo = null, categoria = null) {
    const nuevaURL = new URL(window.location);
    
    nuevaURL.searchParams.delete('tipo');
    nuevaURL.searchParams.delete('subtipo');
    nuevaURL.searchParams.delete('categoria');
    nuevaURL.searchParams.delete('vista');
    
    if (tipo) nuevaURL.searchParams.set('tipo', tipo);
    if (subtipo) nuevaURL.searchParams.set('subtipo', subtipo);
    if (categoria) nuevaURL.searchParams.set('categoria', categoria);
    
    window.history.pushState({}, '', nuevaURL);
    return nuevaURL.toString();
}

function copiarEnlaceCompartir(tipo = null, subtipo = null, categoria = null) {
    const enlace = crearEnlaceFiltro(tipo, subtipo, categoria);
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(enlace).then(() => {
            mostrarNotificacion('✅ Enlace copiado al portapapeles');
            mostrarBotonCompartir(enlace);
        }).catch(err => {
            console.log('Clipboard API falló, usando método alternativo:', err);
            copiarConMetodoAlternativo(enlace);
        });
    } else {
        copiarConMetodoAlternativo(enlace);
    }
}

function copiarConMetodoAlternativo(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '0';
    textarea.style.top = '0';
    
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            mostrarNotificacion('✅ Enlace copiado al portapapeles');
            mostrarBotonCompartir(texto);
            
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                mostrarOpcionesCompartirMovil(texto);
            }
        } else {
            mostrarInputParaCopiar(texto);
        }
    } catch (err) {
        console.error('Error copiando con execCommand:', err);
        mostrarInputParaCopiar(texto);
    } finally {
        document.body.removeChild(textarea);
    }
}

function mostrarInputParaCopiar(texto) {
    const modalHTML = `
    <div class="modal fade" id="modalCopiarEnlace" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📋 Copiar enlace</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="small text-muted mb-2">
                        <i class="bi bi-info-circle"></i> Selecciona y copia el enlace manualmente:
                    </p>
                    <div class="input-group">
                        <input type="text" 
                               class="form-control" 
                               id="inputEnlaceCopiar" 
                               value="${texto}" 
                               readonly>
                        <button class="btn btn-primary" onclick="seleccionarYcopiarInput()">
                            <i class="bi bi-copy"></i>
                        </button>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-outline-primary w-100" 
                                onclick="compartirViaAppMovil('${texto}')">
                            <i class="bi bi-share"></i> Compartir directamente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    const modalContainer = document.getElementById('modal-container') || (() => {
        const div = document.createElement('div');
        div.id = 'modal-container';
        document.body.appendChild(div);
        return div;
    })();
    
    modalContainer.innerHTML = modalHTML;
    const modal = new bootstrap.Modal(document.getElementById('modalCopiarEnlace'));
    modal.show();
    
    setTimeout(() => {
        const input = document.getElementById('inputEnlaceCopiar');
        if (input) {
            input.select();
            input.setSelectionRange(0, texto.length);
        }
    }, 300);
}

function seleccionarYcopiarInput() {
    const input = document.getElementById('inputEnlaceCopiar');
    if (!input) return;
    
    input.select();
    input.setSelectionRange(0, input.value.length);
    
    try {
        document.execCommand('copy');
        mostrarNotificacion('✅ Enlace copiado manualmente');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCopiarEnlace'));
        if (modal) modal.hide();
    } catch (err) {
        mostrarNotificacion('❌ No se pudo copiar. Intenta manualmente.', 'error');
    }
}

function mostrarOpcionesCompartirMovil(enlace) {
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;
    
    const opcionesHTML = `
    <div class="modal fade" id="modalCompartirMovil" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📤 Compartir enlace</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <p class="mb-3">¿Cómo quieres compartir este enlace?</p>
                    
                    <div class="d-flex flex-wrap justify-content-center gap-2">
                        <button class="btn btn-success" 
                                onclick="compartirEnWhatsApp('${enlace}')">
                            <i class="bi bi-whatsapp"></i> WhatsApp
                        </button>
                        
                        <button class="btn btn-primary" 
                                onclick="compartirPorCorreo('${enlace}')">
                            <i class="bi bi-envelope"></i> Correo
                        </button>
                        
                        <button class="btn btn-info" 
                                onclick="compartirPorSMS('${enlace}')">
                            <i class="bi bi-chat"></i> SMS
                        </button>
                        
                        <button class="btn btn-secondary" 
                                onclick="usarShareAPI('${enlace}')">
                            <i class="bi bi-share"></i> Otras apps
                        </button>
                    </div>
                    
                    <div class="mt-3">
                        <small class="text-muted">
                            El enlace ya está en tu portapapeles
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.getElementById('modal-container').innerHTML += opcionesHTML;
    
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('modalCompartirMovil'));
        modal.show();
    }, 500);
}

function compartirEnWhatsApp(enlace) {
    const texto = '¡Mira estos productos en Anmago Store! ' + enlace;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

function compartirPorCorreo(enlace) {
    const asunto = 'Productos de Anmago Store';
    const cuerpo = `¡Hola! Te comparto este enlace de Anmago Store:\n\n${enlace}\n\n¡Échale un vistazo!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

function compartirPorSMS(enlace) {
    const texto = 'Anmago Store - ' + enlace;
    window.location.href = `sms:?body=${encodeURIComponent(texto)}`;
}

function usarShareAPI(enlace) {
    if (navigator.share) {
        navigator.share({
            title: 'Anmago Store',
            text: '¡Mira estos productos!',
            url: enlace
        });
    } else {
        mostrarNotificacion('❌ Tu navegador no soporta compartir directo', 'error');
    }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    let notificacionContainer = document.getElementById('notificacion-container');
    if (!notificacionContainer) {
        notificacionContainer = document.createElement('div');
        notificacionContainer.id = 'notificacion-container';
        notificacionContainer.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificacionContainer);
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show`;
    notificacion.style.cssText = `
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    notificacion.innerHTML = `
        <span>${mensaje}</span>
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    notificacionContainer.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 3000);
}

function mostrarBotonCompartir(enlace) {
    const botonAnterior = document.getElementById('boton-compartir-flotante');
    if (botonAnterior) botonAnterior.remove();
    
    const botonCompartir = document.createElement('div');
    botonCompartir.id = 'boton-compartir-flotante';
    botonCompartir.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 1000;
        background: #007bff;
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0,123,255,0.4);
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        animation: bounceIn 0.5s ease;
    `;
    
    botonCompartir.innerHTML = `
        <i class="bi bi-share" style="font-size: 1.2rem;"></i>
        <span>Compartir enlace</span>
    `;
    
    botonCompartir.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Anmago Store',
                text: '¡Mira estos productos!',
                url: enlace
            });
        } else {
            navigator.clipboard.writeText(enlace);
            mostrarNotificacion('✅ Enlace listo para pegar');
        }
        botonCompartir.remove();
    };
    
    document.body.appendChild(botonCompartir);
    
    setTimeout(() => {
        if (botonCompartir.parentElement) {
            botonCompartir.remove();
        }
    }, 10000);
}

// ==============================================
// FUNCIONES BÁSICAS CORREGIDAS
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

// 🔥 FUNCIÓN CRÍTICA CORREGIDA - SIN SCROLL AUTOMÁTICO
function cambiarAVista(vistaNombre, hacerScroll = false) {
    console.log('📱 Cambiando a vista:', vistaNombre, 'hacerScroll:', hacerScroll);
    
    // Obtener posición actual del scroll ANTES de cambiar
    const scrollPosicion = window.scrollY;
    
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    const vistaElement = document.getElementById(`vista-${vistaNombre}`);
    if (vistaElement) {
        vistaElement.classList.add('vista-activa');
    }
    
    vistaActual = vistaNombre;
    
    // 🔥 SOLO HACER SCROLL si se especifica explícitamente
    if (hacerScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Mantener la posición actual del scroll
        window.scrollTo(0, scrollPosicion);
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
        console.log(`✅ ${productos.length} productos cargados (orden invertido)`);
        return productos;
    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        return [];
    }
}

// ==============================================
// FUNCIÓN PARA CREAR CARD DE PRODUCTO CON DESCUENTOS
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
    
    return `
    <div class="card-producto-ml" data-id="${producto.id}">
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
                    
                    <button class="btn-ver-producto" 
                            onclick="event.preventDefault(); event.stopPropagation(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        </a>
    </div>`;
}

// ==============================================
// CATEGORÍAS RÁPIDAS CORREGIDAS - SOLO FILTROS
// ==============================================

function inicializarCategoriasRapidas() {
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ No hay productos para inicializar categorías');
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
                ${tipo !== 'TODOS' ? `
                <button class="btn-compartir-categoria" 
                        onclick="copiarEnlaceCompartir('${tipo}', null, null)"
                        title="Copiar enlace de ${tipo}">
                    <i class="bi bi-link-45deg"></i>
                </button>
                ` : ''}
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
}

// 🔥 NUEVA FUNCIÓN: Filtrar desde categorías sin cambiar vista
function filtrarPorTipoDesdeCategoria(tipo) {
    console.log('🎯 Filtrando por tipo desde categorías:', tipo);
    
    // Si ya estamos en vista "todos" o "productos", solo aplicar filtro
    if (vistaActual === 'todos' || vistaActual === 'productos') {
        if (tipo === 'TODOS') {
            cargarPorTipo('TODOS');
        } else {
            cargarPorTipo(tipo);
        }
    } else {
        cambiarAVista('productos');
        setTimeout(() => {
            cargarPorTipo(tipo);
        }, 100);
    }
    
    return false;
}

function mostrarCategoriasNivel1(tipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const subtiposUnicos = [...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo)
            .map(p => p.subtipo)
            .filter(Boolean)
    )];

    if (subtiposUnicos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-2">
                No hay subtipos disponibles para ${tipo}
            </div>
        `;
        contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
        return;
    }

    const htmlPrincipal = `
        <div class="categoria-rapida-contenedor">
            <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
               onclick="filtrarPorTipoDesdeCategoria('${tipo}'); return false;">
                <div>${obtenerIcono(tipo, 0)}</div>
                <div>${tipo}</div>
            </a>
            <button class="btn-compartir-categoria" 
                    onclick="copiarEnlaceCompartir('${tipo}', null, null)"
                    title="Copiar enlace de ${tipo}">
                <i class="bi bi-link-45deg"></i>
            </button>
        </div>
    `;
    
    const htmlSubtipos = subtiposUnicos.map(subtipo => {
        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
                   onclick="filtrarPorSubtipoDesdeCategoria('${tipo}', '${subtipo}'); return false;">
                    <div>${obtenerIcono(subtipo, 1)}</div>
                    <div>${subtipo}</div>
                </a>
                <button class="btn-compartir-categoria" 
                        onclick="copiarEnlaceCompartir('${tipo}', '${subtipo}', null)"
                        title="Copiar enlace de ${subtipo}">
                    <i class="bi bi-link-45deg"></i>
                </button>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = htmlPrincipal + htmlSubtipos;
    contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
}

function filtrarPorSubtipoDesdeCategoria(tipo, subtipo) {
    console.log('🎯 Filtrando por subtipo desde categorías:', subtipo);
    
    if (vistaActual === 'todos' || vistaActual === 'productos') {
        cargarPorSubtipo(tipo, subtipo);
    } else {
        cambiarAVista('productos');
        setTimeout(() => {
            cargarPorSubtipo(tipo, subtipo);
        }, 100);
    }
    
    return false;
}

function mostrarCategoriasNivel2(tipo, subtipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const categoriasUnicas = [...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo === subtipo && p.categoria)
            .map(p => p.categoria)
            .filter(Boolean)
    )];

    if (categoriasUnicas.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-2">
                No hay categorías disponibles para ${subtipo}
            </div>
        `;
        contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
        return;
    }

    const htmlPrincipal = `
        <div class="categoria-rapida-contenedor">
            <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
               onclick="filtrarPorSubtipoDesdeCategoria('${tipo}', '${subtipo}'); return false;">
                <div>${obtenerIcono(subtipo, 1)}</div>
                <div>${subtipo}</div>
            </a>
            <button class="btn-compartir-categoria" 
                    onclick="copiarEnlaceCompartir('${tipo}', '${subtipo}', null)"
                    title="Copiar enlace de ${subtipo}">
                <i class="bi bi-link-45deg"></i>
            </button>
        </div>
    `;
    
    const htmlCategorias = categoriasUnicas.map(categoria => {
        const count = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
        ).length;
        
        const contador = count > 0 ? `<span class="badge-categoria-count">${count}</span>` : '';

        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida sin-icono" data-categoria="${categoria}" 
                   onclick="filtrarPorCategoriaDesdeCategoria('${tipo}', '${subtipo}', '${categoria}'); return false;">
                    <div>${categoria}</div>
                    ${contador}
                </a>
                <button class="btn-compartir-categoria" 
                        onclick="copiarEnlaceCompartir('${tipo}', '${subtipo}', '${categoria}')"
                        title="Copiar enlace de ${categoria}">
                    <i class="bi bi-link-45deg"></i>
                </button>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = htmlPrincipal + htmlCategorias;
    contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
}

function filtrarPorCategoriaDesdeCategoria(tipo, subtipo, categoria) {
    console.log('🎯 Filtrando por categoría desde categorías:', categoria);
    
    if (vistaActual === 'todos' || vistaActual === 'productos') {
        cargarPorCategoria(tipo, subtipo, categoria);
    } else {
        cambiarAVista('productos');
        setTimeout(() => {
            cargarPorCategoria(tipo, subtipo, categoria);
        }, 100);
    }
    
    return false;
}

// ==============================================
// FUNCIONES DE NAVEGACIÓN (SIN SCROLL AUTOMÁTICO)
// ==============================================

async function cargarPorTipo(tipo) {
    console.log('📁 Cargando tipo:', tipo);
    
    if (tipo === 'TODOS') {
        cambiarAVista('todos', false);
        await cargarVistaTodos();
        mostrarCategoriasNivel0();
        actualizarURLNavegacion();
        return;
    }

    cambiarAVista('productos', false);
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = 'Todos';
    document.getElementById('breadcrumb-subtipo-link').onclick = null;
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${tipo}`;
    
    actualizarURLNavegacion(tipo, null, null);
    
    await cargarProductosPorTipo(tipo);
    mostrarCategoriasNivel1(tipo);
}

async function cargarPorSubtipo(tipo, subtipo) {
    console.log('📁 Cargando subtipo:', subtipo);
    
    cambiarAVista('productos', false);
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${subtipo}`;
    
    actualizarURLNavegacion(tipo, subtipo, null);
    
    await cargarProductosPorSubtipo(tipo, subtipo);
    mostrarCategoriasNivel2(tipo, subtipo);
}

async function cargarPorCategoria(tipo, subtipo, categoria) {
    console.log('📁 Cargando categoría:', categoria);
    
    cambiarAVista('productos', false);
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = categoria;
    document.getElementById('titulo-productos').textContent = categoria;
    
    actualizarURLNavegacion(tipo, subtipo, categoria);
    
    await cargarProductosPorCategoria(tipo, subtipo, categoria);
    mostrarCategoriasNivel2(tipo, subtipo);
}

// ==============================================
// FUNCIONES DE CARGA DE PRODUCTOS
// ==============================================

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
        console.error('Error cargando productos por tipo:', error);
    }
}

async function cargarProductosPorSubtipo(tipo, subtipo) {
    try {
        let productosFiltrados = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo
        );
        
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
        console.error('Error cargando productos por subtipo:', error);
    }
}

async function cargarProductosPorCategoria(tipo, subtipo, categoria) {
    try {
        let productosFiltrados = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
        );
        
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
// VISTA "TODOS LOS PRODUCTOS" CON SCROLL INFINITO
// ==============================================

async function cargarVistaTodos() {
    try {
        const contador = document.getElementById('contador-todos');
        const grid = document.getElementById('grid-todos');
        const btnContainer = document.getElementById('btn-ver-mas-container');
        const loader = document.getElementById('cargando-todos');
        
        if (!grid || !contador) return;
        
        productosCargados = 0;
        grid.innerHTML = '';
        
        contador.textContent = `0 de ${productosGlobal.length} productos`;
        
        if (loader) loader.classList.remove('d-none');
        
        if (productosGlobal.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="mt-3">No hay productos disponibles</h5>
                </div>
            `;
            if (loader) loader.classList.add('d-none');
            return;
        }
        
        await cargarMasProductosScroll();
        
    } catch (error) {
        console.error('Error cargando vista todos:', error);
    }
}

async function cargarMasProductosScroll() {
    if (cargandoScroll) return;
    
    const grid = document.getElementById('grid-todos');
    const loader = document.getElementById('cargando-todos');
    
    if (!grid) return;
    
    if (productosCargados >= productosGlobal.length) {
        if (loader) loader.classList.add('d-none');
        const btnContainer = document.getElementById('btn-ver-mas-container');
        if (btnContainer) {
            btnContainer.innerHTML = `
                <div class="alert alert-success py-2">
                    <i class="bi bi-check-circle me-2"></i> Todos los productos cargados (${productosGlobal.length})
                </div>
            `;
        }
        return;
    }
    
    cargandoScroll = true;
    if (loader) loader.classList.remove('d-none');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inicio = productosCargados;
    const fin = Math.min(inicio + LIMITE_PRODUCTOS, productosGlobal.length);
    const productosParaMostrar = productosGlobal.slice(inicio, fin);
    
    if (productosParaMostrar.length > 0) {
        productosParaMostrar.forEach(producto => {
            const cardHTML = crearCardProductoHTML(producto);
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        productosCargados += productosParaMostrar.length;
        
        const contador = document.getElementById('contador-todos');
        if (contador) {
            contador.textContent = `${productosCargados} de ${productosGlobal.length} productos`;
        }
        
        const btnContainer = document.getElementById('btn-ver-mas-container');
        if (btnContainer && productosCargados < productosGlobal.length) {
            btnContainer.innerHTML = `
                <button id="btn-ver-mas" class="btn btn-outline-primary" 
                        onclick="cargarMasProductosScroll()">
                    <i class="bi bi-arrow-down me-1"></i> Ver más productos
                </button>
            `;
            btnContainer.classList.remove('d-none');
        }
    }
    
    cargandoScroll = false;
    if (loader) loader.classList.add('d-none');
}

function configurarScrollInfinito() {
    let timeoutId;
    
    function manejarScroll() {
        if (cargandoScroll || vistaActual !== 'todos') return;
        
        const gridTodos = document.getElementById('grid-todos');
        if (!gridTodos) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            cargarMasProductosScroll();
        }
    }
    
    window.addEventListener('scroll', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(manejarScroll, 100);
    });
}

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

function volverAInicio() {
    console.log('🏠 Volviendo al inicio...');
    cambiarAVista('inicio', true);
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
    mostrarCategoriasNivel0();
    
    actualizarURLNavegacion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function configurarInstalacionPWA() {
    const esPWAInstalado = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;

    function esNavegadorEmbebido() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        return ua.includes("FBAN") || ua.includes("FBAV") || ua.includes("Instagram");
    }

    const contenedor = document.getElementById("instalar-container");
    const boton = document.getElementById("boton-instalar");

    if (esPWAInstalado) {
        contenedor?.classList.add("d-none");
        return;
    }

    if (esNavegadorEmbebido()) {
        contenedor?.classList.remove("d-none");
        contenedor.innerHTML = `
          <a href="${window.location.href}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="btn-instalar-app">
             <i class="bi bi-box-arrow-up-right"></i> Para instalar la app, toca los tres puntos arriba y selecciona ‘Abrir en navegador externo'
          </a>`;
        return;
    }

    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        contenedor?.classList.remove("d-none");

        boton?.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const resultado = await deferredPrompt.userChoice;
                deferredPrompt = null;
                contenedor?.classList.add("d-none");
            }
        });
    });
}

// ==============================================
// INICIALIZACIÓN COMPATIBLE CON TU CARRITO.JS
// ==============================================

function inicializarCarritoUltraRapido() {
    console.log('🚀 Inicializando carrito ULTRA RÁPIDO...');
    
    if (typeof inicializarCarrito === 'function') {
        try {
            inicializarCarrito();
            console.log('✅ carrito.js inicializado');
        } catch (e) {
            console.error('❌ Error inicializando carrito.js:', e);
        }
    }
    
    setInterval(actualizarContadoresCarritoCompatible, 1000);
    
    console.log('✅ Carrito configurado para actualización ultra rápida');
}

function actualizarContadoresCarritoCompatible() {
    try {
        if (window.carritoManager) {
            window.carritoManager.actualizarContadoresCarrito();
            return;
        }
        
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        let totalItems = 0;
        
        if (carritoGuardado) {
            try {
                const carrito = JSON.parse(carritoGuardado);
                totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
            } catch (e) {
                console.error('Error parseando carrito:', e);
            }
        }
        
        const contadores = document.querySelectorAll('[id*="contador-carrito"]');
        contadores.forEach(elemento => {
            elemento.textContent = totalItems;
            elemento.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        
    } catch (error) {
        console.error('Error actualizando contadores:', error);
    }
}

// ==============================================
// INICIALIZACIÓN PRINCIPAL
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Inicializando Anmago Store...');
    
    const { tipo, subtipo, categoria, vista } = getParametrosDesdeURL();

    inicializarCarritoUltraRapido();
    
    await cargarCatalogoGlobal();
    
    inicializarCategoriasRapidas();
    
    configurarInstalacionPWA();
    
    configurarScrollInfinito();
    
    setTimeout(() => {
        if (tipo && subtipo && categoria) {
            cargarPorCategoria(tipo, subtipo, categoria);
        } else if (tipo && subtipo) {
            cargarPorSubtipo(tipo, subtipo);
        } else if (tipo) {
            cargarPorTipo(tipo);
        } else {
            volverAInicio();
        }
    }, 1000);
    
    const style = document.createElement('style');
    style.textContent = `
        .categoria-rapida-contenedor {
            position: relative;
            display: inline-block;
        }
        
        .btn-compartir-categoria {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 123, 255, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
        
        .categoria-rapida-contenedor:hover .btn-compartir-categoria {
            opacity: 1;
        }
        
        .btn-compartir-categoria:hover {
            background: #0056b3;
            transform: scale(1.1);
        }
        
        .badge-categoria-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            font-size: 10px;
            min-width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes bounceIn {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .vista-system {
            min-height: 70vh;
        }
        
        #vista-productos, #vista-todos {
            padding-top: 20px;
        }
    `;
    document.head.appendChild(style);
    
    window.volverAInicio = volverAInicio;
    window.mostrarCatalogoCompleto = function() {
        cargarPorTipo('TODOS');
    };
    
    console.log('✅ Anmago Store inicializada correctamente');
});

// ==============================================
// FUNCIONES DE COMPATIBILIDAD
// ==============================================

function mostrarTodosLosProductos() {
    cargarPorTipo('TODOS');
}

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

function mostrarTodosLosProductosCompleto() {
    cargarPorTipo('TODOS');
}

window.cerrarMenu = function() {
    const offcanvas = bootstrap?.Offcanvas?.getInstance(document.getElementById('menuLateral'));
    if (offcanvas) offcanvas.hide();
};
