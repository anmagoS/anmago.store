// ==============================================
// ANMAGO STORE - APP.JS SIMPLIFICADO CON ENLACES COMPARTIBLES
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

// Función para crear enlace con parámetros
function crearEnlaceFiltro(tipo = null, subtipo = null, categoria = null) {
    const url = new URL(window.location.origin + window.location.pathname);
    
    if (tipo) {
        url.searchParams.set('tipo', tipo);
    }
    
    if (subtipo) {
        url.searchParams.set('subtipo', subtipo);
    }
    
    if (categoria) {
        url.searchParams.set('categoria', categoria);
    }
    
    return url.toString();
}

// Función para actualizar URL del navegador
function actualizarURLNavegacion(tipo = null, subtipo = null, categoria = null) {
    const nuevaURL = new URL(window.location);
    
    // Limpiar parámetros anteriores
    nuevaURL.searchParams.delete('tipo');
    nuevaURL.searchParams.delete('subtipo');
    nuevaURL.searchParams.delete('categoria');
    nuevaURL.searchParams.delete('vista');
    
    // Agregar nuevos parámetros
    if (tipo) {
        nuevaURL.searchParams.set('tipo', tipo);
    }
    
    if (subtipo) {
        nuevaURL.searchParams.set('subtipo', subtipo);
    }
    
    if (categoria) {
        nuevaURL.searchParams.set('categoria', categoria);
    }
    
    // Actualizar URL sin recargar la página
    window.history.pushState({}, '', nuevaURL);
    
    // Retornar también el enlace para compartir
    return nuevaURL.toString();
}

// Función universal para copiar enlaces (funciona en todos los dispositivos)
function copiarEnlaceCompartir(tipo = null, subtipo = null, categoria = null) {
    const enlace = crearEnlaceFiltro(tipo, subtipo, categoria);
    
    // Método moderno con Clipboard API (funciona en navegadores modernos)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(enlace).then(() => {
            mostrarNotificacion('✅ Enlace copiado al portapapeles');
            mostrarBotonCompartir(enlace);
        }).catch(err => {
            // Si falla, usar método alternativo
            console.log('Clipboard API falló, usando método alternativo:', err);
            copiarConMetodoAlternativo(enlace);
        });
    } else {
        // Método alternativo para navegadores antiguos y iOS
        copiarConMetodoAlternativo(enlace);
    }
}

// Método alternativo que funciona en iOS y Android antiguo
function copiarConMetodoAlternativo(texto) {
    // Método 1: Usar textarea temporal
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    
    // Hacerlo invisible pero no display:none (iOS necesita ser visible)
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '0';
    textarea.style.top = '0';
    
    document.body.appendChild(textarea);
    
    // Seleccionar el texto
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Para móviles
    
    try {
        // Intentar copiar
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            mostrarNotificacion('✅ Enlace copiado al portapapeles');
            mostrarBotonCompartir(texto);
            
            // También mostrar opción de compartir directamente en móviles
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
        // Limpiar
        document.body.removeChild(textarea);
    }
}

// Mostrar input para que el usuario copie manualmente (último recurso)
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
    
    // Agregar modal al DOM
    const modalContainer = document.getElementById('modal-container') || 
                          (() => {
                              const div = document.createElement('div');
                              div.id = 'modal-container';
                              document.body.appendChild(div);
                              return div;
                          })();
    
    modalContainer.innerHTML = modalHTML;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalCopiarEnlace'));
    modal.show();
    
    // Auto-seleccionar el texto
    setTimeout(() => {
        const input = document.getElementById('inputEnlaceCopiar');
        if (input) {
            input.select();
            input.setSelectionRange(0, texto.length);
        }
    }, 300);
}

// Función para seleccionar y copiar desde el input
function seleccionarYcopiarInput() {
    const input = document.getElementById('inputEnlaceCopiar');
    if (!input) return;
    
    input.select();
    input.setSelectionRange(0, input.value.length);
    
    try {
        document.execCommand('copy');
        mostrarNotificacion('✅ Enlace copiado manualmente');
        
        // Cerrar modal después de copiar
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCopiarEnlace'));
        if (modal) modal.hide();
    } catch (err) {
        mostrarNotificacion('❌ No se pudo copiar. Intenta manualmente.', 'error');
    }
}

// Mostrar opciones de compartir específicas para móviles
function mostrarOpcionesCompartirMovil(enlace) {
    // Solo mostrar si es dispositivo móvil
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
                        <!-- WhatsApp -->
                        <button class="btn btn-success" 
                                onclick="compartirEnWhatsApp('${enlace}')">
                            <i class="bi bi-whatsapp"></i> WhatsApp
                        </button>
                        
                        <!-- Correo -->
                        <button class="btn btn-primary" 
                                onclick="compartirPorCorreo('${enlace}')">
                            <i class="bi bi-envelope"></i> Correo
                        </button>
                        
                        <!-- SMS (solo móviles) -->
                        <button class="btn btn-info" 
                                onclick="compartirPorSMS('${enlace}')">
                            <i class="bi bi-chat"></i> SMS
                        </button>
                        
                        <!-- Otras apps -->
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
    
    // Mostrar modal después de un breve delay
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('modalCompartirMovil'));
        modal.show();
    }, 500);
}

// Funciones específicas para compartir
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

// Mostrar notificación temporal
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear o reutilizar contenedor de notificaciones
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
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 3000);
}

// Mostrar botón flotante para compartir
function mostrarBotonCompartir(enlace) {
    // Eliminar botón anterior si existe
    const botonAnterior = document.getElementById('boton-compartir-flotante');
    if (botonAnterior) botonAnterior.remove();
    
    // Crear botón flotante
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
        // Opciones de compartir
        if (navigator.share) {
            navigator.share({
                title: 'Anmago Store',
                text: '¡Mira estos productos!',
                url: enlace
            });
        } else {
            // Si no soporta Web Share API, copiar al portapapeles
            navigator.clipboard.writeText(enlace);
            mostrarNotificacion('✅ Enlace listo para pegar');
        }
        botonCompartir.remove();
    };
    
    document.body.appendChild(botonCompartir);
    
    // Auto-eliminar después de 10 segundos
    setTimeout(() => {
        if (botonCompartir.parentElement) {
            botonCompartir.remove();
        }
    }, 10000);
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
    if (nivel === 2) return ''; // Sin icono para categorías
    return ICONOS_CATEGORIAS[categoria] || '📦';
}

function cambiarAVista(vistaNombre) {
    console.log('📱 Cambiando a vista:', vistaNombre);
    
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    const vistaElement = document.getElementById(`vista-${vistaNombre}`);
    if (vistaElement) {
        vistaElement.classList.add('vista-activa');
    }
    
    vistaActual = vistaNombre;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function cargarCatalogoGlobal() {
    try {
        console.log('📦 Cargando catálogo...');
        const url = "https://raw.githubusercontent.com/anmagoS/anmago.store/main/catalogo.json";
        const res = await fetch(url);
        const productos = await res.json();
        
        productosGlobal = productos;
        console.log(`✅ ${productos.length} productos cargados`);
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
    
    // Verificar si el producto está en promoción
    const estaEnPromo = producto.promo === true || producto.promo === "true" || producto.promo === "sí";
    
    if (estaEnPromo) {
        // Calcular descuento del 10%
        const descuentoPorcentaje = 10;
        precioFinal = Math.round(precioOriginal * 0.9);
        
        badgePromo = `<div class="badge-promo">-${descuentoPorcentaje}%</div>`;
        mostrarPrecioAnterior = true;
    }
    
    // Verificar stock
    const badgeStock = producto.stock <= 5 ? 
        `<div class="badge-stock">Últimas ${producto.stock}</div>` : '';
    
    // Obtener imagen correcta
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
// CATEGORÍAS RÁPIDAS CON ENLACES COMPARTIBLES
// ==============================================

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
        let icono = '🛍️';
        
        if (tipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count"></span>`;
            }
            icono = obtenerIcono(tipo, 0);
        }

        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
                   onclick="cargarPorTipo('${tipo}'); return false;">
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

// Mostrar nivel 1: Subtipos (con el nombre del tipo como primer elemento)
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
                No hay subtipos disponibles
            </div>
        `;
        contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
        return;
    }

    // Primero el botón que muestra el tipo actual (en lugar de "TODOS")
    const htmlPrincipal = `
        <div class="categoria-rapida-contenedor">
            <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
               onclick="cargarPorTipo('${tipo}'); return false;">
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
    
    // Luego los subtipos
    const htmlSubtipos = subtiposUnicos.map(subtipo => {
        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
                   onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
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

// Mostrar nivel 2: Categorías (con el nombre del subtipo como primer elemento)
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
                No hay categorías disponibles
            </div>
        `;
        contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
        return;
    }

    // Primero el botón que muestra el subtipo actual (en lugar de "TODAS")
    const htmlPrincipal = `
        <div class="categoria-rapida-contenedor">
            <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
               onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
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
    
    // Luego las categorías
    const htmlCategorias = categoriasUnicas.map(categoria => {
        const count = productosGlobal.filter(p => 
            p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
        ).length;
        
        const contador = count > 0 ? `<span class="badge-categoria-count"></span>` : '';

        return `
            <div class="categoria-rapida-contenedor">
                <a href="#" class="categoria-rapida sin-icono" data-categoria="${categoria}" 
                   onclick="cargarPorCategoria('${tipo}', '${subtipo}', '${categoria}'); return false;">
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

// ==============================================
// FUNCIONES DE NAVEGACIÓN (ACTUALIZADAS)
// ==============================================

async function cargarPorTipo(tipo) {
    console.log('📁 Cargando tipo:', tipo);
    
    if (tipo === 'TODOS') {
        cambiarAVista('todos');
        await cargarVistaTodos();
        mostrarCategoriasNivel0();
        // Actualizar URL para "todos"
        actualizarURLNavegacion();
        return;
    }

    cambiarAVista('productos');
    
    // Actualizar breadcrumbs y título
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = 'Todos';
    document.getElementById('breadcrumb-subtipo-link').onclick = null;
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${tipo}`;
    
    // Actualizar URL
    actualizarURLNavegacion(tipo, null, null);
    
    // Cargar productos
    await cargarProductosPorTipo(tipo);
    mostrarCategoriasNivel1(tipo);
}

async function cargarPorSubtipo(tipo, subtipo) {
    console.log('📁 Cargando subtipo:', subtipo);
    
    cambiarAVista('productos');
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = '';
    document.getElementById('titulo-productos').textContent = `Productos de ${subtipo}`;
    
    // Actualizar URL
    actualizarURLNavegacion(tipo, subtipo, null);
    
    await cargarProductosPorSubtipo(tipo, subtipo);
    mostrarCategoriasNivel2(tipo, subtipo);
}

async function cargarPorCategoria(tipo, subtipo, categoria) {
    console.log('📁 Cargando categoría:', categoria);
    
    cambiarAVista('productos');
    
    document.getElementById('breadcrumb-tipo-link-prod').textContent = tipo;
    document.getElementById('breadcrumb-tipo-link-prod').onclick = () => cargarPorTipo(tipo);
    document.getElementById('breadcrumb-subtipo-link').textContent = subtipo;
    document.getElementById('breadcrumb-subtipo-link').onclick = () => cargarPorSubtipo(tipo, subtipo);
    document.getElementById('breadcrumb-categoria').textContent = categoria;
    document.getElementById('titulo-productos').textContent = categoria;
    
    // Actualizar URL
    actualizarURLNavegacion(tipo, subtipo, categoria);
    
    await cargarProductosPorCategoria(tipo, subtipo, categoria);
    mostrarCategoriasNivel2(tipo, subtipo);
}

// ==============================================
// FUNCIONES DE CARGA DE PRODUCTOS
// ==============================================

async function cargarProductosPorTipo(tipo) {
    try {
        const productosFiltrados = productosGlobal.filter(p => p.tipo === tipo);
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
    }
}

async function cargarProductosPorCategoria(tipo, subtipo, categoria) {
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
    cambiarAVista('inicio');
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
    mostrarCategoriasNivel0();
    
    // Limpiar URL
    actualizarURLNavegacion();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
// SISTEMA DE CARRITO COMPLETO CON CAMBIO DE CANTIDADES
// ==============================================

// Variable global para el intervalo del carrito
let intervaloCarrito = null;

// Función para inicializar el sistema de carrito de forma ULTRA RÁPIDA
function inicializarCarritoUltraRapido() {
    console.log('🚀 Inicializando carrito ULTRA RÁPIDO...');
    
    // 1. Inicializar carritoManager si está disponible (de carrito.js)
    if (typeof inicializarCarrito === 'function') {
        try {
            inicializarCarrito();
            console.log('✅ carrito.js inicializado');
        } catch (e) {
            console.error('❌ Error inicializando carrito.js:', e);
        }
    }
    
    // 2. Configurar inmediatamente los eventos del offcanvas
    configurarEventosOffcanvasInmediato();
    
    // 3. Actualizar contadores cada segundo
    setInterval(actualizarContadoresCarrito, 1000);
    
    // 4. Configurar listener para cambios en localStorage
    window.addEventListener('storage', manejarCambioStorage);
    
    // 5. Configurar evento para cuando se agregan productos
    if (typeof window.agregarAlCarrito === 'function') {
        const originalAgregarAlCarrito = window.agregarAlCarrito;
        window.agregarAlCarrito = function(producto) {
            const resultado = originalAgregarAlCarrito.call(this, producto);
            // Forzar actualización inmediata después de agregar
            setTimeout(actualizarCarritoVisible, 100);
            return resultado;
        };
    }
    
    console.log('✅ Carrito configurado para actualización ultra rápida');
}

// Configurar eventos del offcanvas INMEDIATAMENTE
function configurarEventosOffcanvasInmediato() {
    // Buscar el offcanvas cada 100ms hasta encontrarlo
    const buscarOffcanvas = setInterval(() => {
        const offcanvasElement = document.getElementById('offcanvasCarrito');
        if (offcanvasElement) {
            clearInterval(buscarOffcanvas);
            
            // Configurar evento cuando se abre el offcanvas
            offcanvasElement.addEventListener('show.bs.offcanvas', function() {
                console.log('🎯 Offcanvas abierto, actualizando INMEDIATAMENTE...');
                // Actualizar 3 veces con delays pequeños para asegurar
                setTimeout(actualizarCarritoVisible, 10);
                setTimeout(actualizarCarritoVisible, 100);
                setTimeout(actualizarCarritoVisible, 500);
                
                // Configurar actualización cada 500ms mientras esté abierto
                if (intervaloCarrito) {
                    clearInterval(intervaloCarrito);
                }
                intervaloCarrito = setInterval(actualizarCarritoVisible, 500);
            });
            
            // Limpiar intervalo cuando se cierra
            offcanvasElement.addEventListener('hidden.bs.offcanvas', function() {
                console.log('📦 Offcanvas cerrado');
                if (intervaloCarrito) {
                    clearInterval(intervaloCarrito);
                    intervaloCarrito = null;
                }
            });
            
            console.log('✅ Offcanvas configurado para actualización instantánea');
        }
    }, 100);
}

// Actualizar contadores del carrito
function actualizarContadoresCarrito() {
    try {
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
        
        // Actualizar TODOS los contadores encontrados
        const contadores = document.querySelectorAll('[id*="contador-carrito"]');
        contadores.forEach(elemento => {
            elemento.textContent = totalItems;
            elemento.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        
    } catch (error) {
        console.error('Error actualizando contadores:', error);
    }
}

// Actualizar el carrito visible (contenido del offcanvas) CON CAMBIO DE CANTIDADES
function actualizarCarritoVisible() {
    const contenedor = document.getElementById('carrito-contenido');
    const subtotalElement = document.getElementById('subtotal');
    
    if (!contenedor) {
        console.log('⚠️ Contenedor del carrito no encontrado');
        return;
    }
    
    try {
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        
        if (!carritoGuardado || carritoGuardado === '[]') {
            contenedor.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-bag-x fs-1"></i>
                    <p class="mt-2">Tu carrito está vacío</p>
                </div>
            `;
            if (subtotalElement) {
                subtotalElement.textContent = '0';
            }
            return;
        }
        
        const carrito = JSON.parse(carritoGuardado);
        
        if (!carrito || carrito.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-bag-x fs-1"></i>
                    <p class="mt-2">Tu carrito está vacío</p>
                </div>
            `;
            if (subtotalElement) {
                subtotalElement.textContent = '0';
            }
            return;
        }
        
        // Generar HTML de los productos CON CONTROLES DE CANTIDAD
        const htmlCarrito = carrito.map(item => {
            const precio = item.precio || 0;
            const cantidad = item.cantidad || 1;
            const nombre = item.nombre || 'Producto sin nombre';
            const imagen = item.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
            const talla = item.talla || 'Única';
            const variante = item.variante || '';
            const id = item.id || '';
            
            return `
            <div class="card mb-2 border-0 shadow-sm carrito-item" data-id="${id}" data-talla="${talla}">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${imagen}" 
                                 alt="${nombre}" 
                                 class="img-fluid rounded" 
                                 style="height: 60px; object-fit: cover; width: 100%;"
                                 onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                        </div>
                        <div class="col-6">
                            <h6 class="card-title mb-1 small fw-bold">${nombre}</h6>
                            <p class="card-text mb-1 small text-muted">
                                ${variante ? variante + ' • ' : ''}Talla: ${talla}
                            </p>
                            <p class="card-text mb-0 fw-bold text-primary">${precio.toLocaleString('es-CO')}</p>
                        </div>
                        <div class="col-3">
                            <div class="d-flex align-items-center justify-content-center mb-1">
                                <!-- Botón para disminuir cantidad -->
                                <button class="btn btn-sm btn-outline-secondary px-2" 
                                        onclick="cambiarCantidadCarrito('${id}', '${talla}', ${cantidad - 1})"
                                        ${cantidad <= 1 ? 'disabled' : ''}>
                                    <i class="bi bi-dash"></i>
                                </button>
                                
                                <!-- Cantidad actual -->
                                <span class="mx-2 fw-bold">${cantidad}</span>
                                
                                <!-- Botón para aumentar cantidad -->
                                <button class="btn btn-sm btn-outline-secondary px-2"
                                        onclick="cambiarCantidadCarrito('${id}', '${talla}', ${cantidad + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-sm btn-danger mt-1 w-100" 
                                    onclick="eliminarDelCarritoLocal('${id}', '${talla}')">
                                <i class="bi bi-trash"></i> 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        contenedor.innerHTML = htmlCarrito;
        
        // Actualizar subtotal
        if (subtotalElement) {
            const subtotal = carrito.reduce((total, item) => {
                return total + ((item.precio || 0) * (item.cantidad || 1));
            }, 0);
            subtotalElement.textContent = `${subtotal.toLocaleString('es-CO')}`;
            subtotalElement.classList.add('text-success');
        }
        
        console.log(`✅ Carrito actualizado: ${carrito.length} productos`);
        
    } catch (error) {
        console.error('❌ Error actualizando carrito visible:', error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                <p>Error al cargar el carrito</p>
            </div>
        `;
    }
}

// Función para cambiar la cantidad de un producto en el carrito
function cambiarCantidadCarrito(id, talla, nuevaCantidad) {
    try {
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (!carritoGuardado) return;
        
        const carrito = JSON.parse(carritoGuardado);
        
        // Buscar el producto
        const productoIndex = carrito.findIndex(item => 
            item.id === id && item.talla === talla
        );
        
        if (productoIndex === -1) {
            console.log('⚠️ Producto no encontrado en el carrito');
            return;
        }
        
        if (nuevaCantidad <= 0) {
            // Si la cantidad es 0 o negativa, eliminar el producto
            carrito.splice(productoIndex, 1);
        } else {
            // Actualizar la cantidad
            carrito[productoIndex].cantidad = nuevaCantidad;
        }
        
        // Guardar en localStorage
        localStorage.setItem('carritoAnmago', JSON.stringify(carrito));
        
        // Disparar evento storage manualmente para sincronizar otras pestañas
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'carritoAnmago',
            newValue: JSON.stringify(carrito)
        }));
        
        // Actualizar inmediatamente
        actualizarCarritoVisible();
        actualizarContadoresCarrito();
        
        // Notificación si se elimina
        if (nuevaCantidad <= 0) {
            mostrarNotificacion('🗑️ Producto eliminado del carrito');
        } else {
            console.log(`✅ Cantidad actualizada a: ${nuevaCantidad}`);
        }
        
    } catch (error) {
        console.error('Error cambiando cantidad del carrito:', error);
        mostrarNotificacion('❌ Error al cambiar cantidad', 'error');
    }
}

// Función para eliminar producto del carrito (local)
function eliminarDelCarritoLocal(id, talla) {
    try {
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (!carritoGuardado) return;
        
        const carrito = JSON.parse(carritoGuardado);
        const nuevoCarrito = carrito.filter(item => !(item.id === id && item.talla === talla));
        
        localStorage.setItem('carritoAnmago', JSON.stringify(nuevoCarrito));
        
        // Disparar evento storage manualmente para sincronizar otras pestañas
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'carritoAnmago',
            newValue: JSON.stringify(nuevoCarrito)
        }));
        
        // Actualizar inmediatamente
        actualizarCarritoVisible();
        actualizarContadoresCarrito();
        
        // Notificación
        mostrarNotificacion('🗑️ Producto eliminado del carrito');
        
    } catch (error) {
        console.error('Error eliminando del carrito:', error);
        mostrarNotificacion('❌ Error al eliminar producto', 'error');
    }
}

// Manejar cambios en localStorage (para sincronización entre pestañas)
function manejarCambioStorage(event) {
    if (event.key === 'carritoAnmago') {
        console.log('📡 Cambio detectado en localStorage');
        // Actualizar contadores
        actualizarContadoresCarrito();
        
        // Si el carrito está visible, actualizarlo también
        const offcanvasAbierto = document.getElementById('offcanvasCarrito')?.classList.contains('show');
        if (offcanvasAbierto) {
            actualizarCarritoVisible();
        }
    }
}

// ==============================================
// INICIALIZACIÓN PRINCIPAL
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Inicializando Anmago Store...');
    
    const { tipo, subtipo, categoria, vista } = getParametrosDesdeURL();

    // 🔥 INICIALIZAR CARRITO INMEDIATAMENTE (LO PRIMERO)
    inicializarCarritoUltraRapido();
    
    // 1. Cargar catálogo global
    await cargarCatalogoGlobal();
    
    // 2. Inicializar categorías rápidas
    inicializarCategoriasRapidas();
    
    // 3. Configurar PWA
    configurarInstalacionPWA();
    
    // 4. Configurar scroll infinito
    configurarScrollInfinito();
    
    // 5. Cargar header dinámicamente
    const headerContainer = document.getElementById("header-container");
    if (headerContainer && !headerContainer.querySelector(".header-sticky")) {
        try {
            const header = await fetch("HEADER.HTML").then(res => res.text());
            headerContainer.insertAdjacentHTML("afterbegin", header);
            
            // Forzar actualización del carrito después de cargar header
            setTimeout(() => {
                actualizarContadoresCarrito();
            }, 300);
            
        } catch (error) {
            console.error("❌ Error cargando header:", error);
        }
    }
    
    // 6. Manejar navegación desde URL
    setTimeout(() => {
        if (tipo && subtipo && categoria) {
            cargarPorCategoria(tipo, subtipo, categoria);
        } else if (tipo && subtipo) {
            cargarPorSubtipo(tipo, subtipo);
        } else if (tipo) {
            cargarPorTipo(tipo);
        } else {
            cargarPorTipo('TODOS');
        }
    }, 1000);
    
    // Agregar CSS solo para botones de compartir (mínimo necesario)
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
    `;
    document.head.appendChild(style);
    
    // Configurar funciones globales
    window.actualizarCarritoVisible = actualizarCarritoVisible;
    window.eliminarDelCarritoLocal = eliminarDelCarritoLocal;
    window.cambiarCantidadCarrito = cambiarCantidadCarrito;
    
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
