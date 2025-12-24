// ==============================================
// BUSCADOR.JS - SISTEMA OPTIMIZADO
// ==============================================

class BuscadorManager {
    constructor() {
        this.catalogo = [];
        this.timeoutBusqueda = null;
        this.elementos = {
            input: null,
            sugerencias: null
        };
        this.init();
    }

    async init() {
        console.log('🔍 Iniciando buscador...');
        
        // Esperar a que los elementos estén disponibles
        await this.esperarElementos();
        
        // Cargar catálogo
        await this.cargarCatalogo();
        
        // Configurar eventos
        this.configurarEventos();
        
        console.log('✅ Buscador listo');
    }

    async esperarElementos() {
        return new Promise((resolve) => {
            const buscar = () => {
                this.elementos.input = document.getElementById('buscador');
                this.elementos.sugerencias = document.getElementById('sugerencias');
                
                if (this.elementos.input && this.elementos.sugerencias) {
                    console.log('✅ Elementos del buscador encontrados');
                    resolve();
                } else {
                    setTimeout(buscar, 500);
                }
            };
            buscar();
        });
    }

    async cargarCatalogo() {
        try {
            console.log('📦 Cargando catálogo para búsqueda...');
            
            // Intentar usar el catálogo global primero
            if (window.productosGlobal && window.productosGlobal.length > 0) {
                this.catalogo = window.productosGlobal;
                console.log(`✅ Usando catálogo global: ${this.catalogo.length} productos`);
                return;
            }
            
            // Si no está disponible, cargar desde URL
            const response = await fetch(
                'https://raw.githubusercontent.com/anmagoS/anmago.store/main/catalogo.json?v=' + Date.now()
            );
            
            this.catalogo = await response.json();
            console.log(`✅ Catálogo cargado: ${this.catalogo.length} productos`);
            
        } catch (error) {
            console.error('❌ Error cargando catálogo para búsqueda:', error);
            this.catalogo = [];
        }
    }

    buscar(texto) {
        if (!texto || texto.length < 2) {
            return [];
        }
        
        const textoBusqueda = texto.toLowerCase().trim();
        
        return this.catalogo.filter(producto => {
            const campos = [
                producto.producto,
                producto.tipo,
                producto.subtipo,
                producto.categoria,
                producto.descripcion
            ];
            
            return campos.some(campo => 
                campo && campo.toString().toLowerCase().includes(textoBusqueda)
            );
        });
    }

    mostrarSugerencias(productos, textoBusqueda) {
        const { sugerencias } = this.elementos;
        sugerencias.innerHTML = '';
        
        if (productos.length === 0) {
            if (textoBusqueda.length >= 2) {
                sugerencias.innerHTML = `
                    <div class="sugerencia-vacia">
                        No hay resultados para "${textoBusqueda}"
                    </div>`;
            }
            sugerencias.classList.add('mostrar');
            return;
        }
        
        // Limitar a 8 sugerencias
        const productosMostrar = productos.slice(0, 8);
        
        productosMostrar.forEach(producto => {
            const precio = Number(producto.precio) || 0;
            const imagen = producto.imagen || 
                          producto.imagenes?.[0]?.url || 
                          'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg';
            
            const item = document.createElement('div');
            item.className = 'sugerencia-item';
            item.innerHTML = `
                <img src="${imagen}" 
                     alt="${producto.producto}"
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                <div class="sugerencia-info">
                    <div class="sugerencia-nombre">${producto.producto}</div>
                    <div class="sugerencia-categoria">${producto.tipo} › ${producto.subtipo || ''}</div>
                    <div class="sugerencia-precio">$${precio.toLocaleString('es-CO')}</div>
                </div>`;
            
            item.addEventListener('click', () => {
                console.log('🎯 Navegando a:', producto.producto);
                window.location.href = `PRODUCTO.HTML?id=${producto.id}`;
            });
            
            sugerencias.appendChild(item);
        });

        sugerencias.classList.add('mostrar');
        console.log(`📦 Mostrando ${productosMostrar.length} sugerencias`);
    }

    ocultarSugerencias() {
        this.elementos.sugerencias.classList.remove('mostrar');
    }

    ejecutarBusqueda(texto) {
        clearTimeout(this.timeoutBusqueda);
        
        this.timeoutBusqueda = setTimeout(() => {
            const resultados = this.buscar(texto);
            this.mostrarSugerencias(resultados, texto);
        }, 300);
    }

    configurarEventos() {
        const { input, sugerencias } = this.elementos;

        // Input
        input.addEventListener('input', (e) => {
            this.ejecutarBusqueda(e.target.value);
        });

        // Focus
        input.addEventListener('focus', (e) => {
            if (e.target.value.length >= 2) {
                const resultados = this.buscar(e.target.value);
                this.mostrarSugerencias(resultados, e.target.value);
            }
        });

        // Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim().length >= 2) {
                e.preventDefault();
                const resultados = this.buscar(e.target.value);
                if (resultados.length > 0) {
                    window.location.href = `PRODUCTO.HTML?id=${resultados[0].id}`;
                }
            }
        });

        // Click fuera
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !sugerencias.contains(e.target)) {
                this.ocultarSugerencias();
            }
        });

        // Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ocultarSugerencias();
                input.blur();
            }
        });

        console.log('✅ Eventos del buscador configurados');
    }
}

// ========== INICIALIZACIÓN ==========

let buscadorManager;

function inicializarBuscador() {
    if (window.buscadorManager) {
        console.log('✅ Buscador ya inicializado');
        return;
    }
    
    buscadorManager = new BuscadorManager();
    window.buscadorManager = buscadorManager;
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(inicializarBuscador, 1000);
    });
} else {
    setTimeout(inicializarBuscador, 1000);
}

// Reintentar por si acaso
setTimeout(inicializarBuscador, 3000);

console.log('🔍 buscador.js cargado');
