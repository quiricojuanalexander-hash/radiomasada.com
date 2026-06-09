// ===== OREMRD - FUNCIONALIDAD REAL COMPLETA =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== MOBILE MENU TOGGLE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('show');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('show');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // ===== HERO SLIDER =====
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        slides.forEach(function (s) { s.classList.remove('active'); });
        dots.forEach(function (d) { d.classList.remove('active'); });
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlideFunc() { showSlide(currentSlide + 1); }
    function prevSlideFunc() { showSlide(currentSlide - 1); }
    function startAuto() { slideInterval = setInterval(nextSlideFunc, 5000); }
    function stopAuto() { clearInterval(slideInterval); }

    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); nextSlideFunc(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); prevSlideFunc(); startAuto(); });
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () { stopAuto(); showSlide(parseInt(this.dataset.slide)); startAuto(); });
    });

    // Touch swipe
    var touchStartX = 0;
    var sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        sliderContainer.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { stopAuto(); diff > 0 ? nextSlideFunc() : prevSlideFunc(); startAuto(); }
        }, { passive: true });
    }
    if (slides.length > 0) startAuto();

    // ===== REAL AUDIO PLAYER - Radio Masada =====
    // Stream real de Radio Masada (OREMRD)
    // Preferir un elemento <audio id="main-radio-audio"> si ya existe en la página para evitar duplicados
    var radioAudio = null;
    var domAudioEl = document.getElementById('main-radio-audio');
    if (domAudioEl && domAudioEl.tagName && domAudioEl.tagName.toLowerCase() === 'audio') {
        radioAudio = domAudioEl;
        radioAudio.preload = radioAudio.preload || 'none';
    } else {
        radioAudio = new Audio();
        radioAudio.preload = 'none';
    }
    // URL del stream: se puede configurar por el usuario y se guarda en localStorage
    var storedURL = localStorage.getItem('oremrd_stream_url');
    // Forzar la URL solicitada por el usuario (primaria)
    var forcedURL = 'https://uk16freenew.listen2myradio.com/live.mp3?typeportmount=s1_12175_stream_61395715';
    var radioStreamURL = forcedURL;
    try { localStorage.setItem('oremrd_stream_url', radioStreamURL); } catch (e) { /* ignorar si storage no está disponible */ }
    // Fallback conocido que devuelve audio/mpeg (usado cuando la URL primaria no sirve)
    var radioFallbackURL = 'https://fpsnew1.listen2myradio.com:2199/listen.php?ip=82.145.63.6&port=8959&type=s2&mount=1';
    // La siguiente línea ha sido deshabilitada para usar la URL principal solicitada.
    // radioStreamURL = radioFallbackURL;
    // try { localStorage.setItem('oremrd_stream_url', radioStreamURL); } catch (e) { /* ignorar si storage no está disponible */ }
    radioAudio.volume = 0.8;
    var usingFallback = false;
    var playWatchTimer = null;

    // Radio player - Barra del index
    var playBtn = document.getElementById('radioPlayBtn') || document.getElementById('main-play-btn');
    var visualizer = document.querySelector('.audio-visualizer');
    var isPlaying = false;
    var mainPlayBtnEl = document.getElementById('main-play-btn');
    var mainPauseBtnEl = document.getElementById('main-pause-btn');

    // Radio player - Página de radio (grande)
    var playLarge = document.getElementById('radioPlayLarge');
    var vizLarge = document.getElementById('radioVisualizer');
    var statusEl = document.getElementById('radioStatus');
    var isPlayingLarge = false;

    function updateRadioUI(playing) {
        // Actualizar barra del index: manejar ambos tipos de botones
        if (playBtn) {
            var icon = playBtn.querySelector && playBtn.querySelector('i');
            if (icon) {
                if (playing) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                    playBtn.classList.add('playing');
                    if (visualizer) visualizer.classList.add('active');
                } else {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                    playBtn.classList.remove('playing');
                    if (visualizer) visualizer.classList.remove('active');
                }
            } else if (mainPlayBtnEl && mainPauseBtnEl) {
                // botones simples sin <i>
                if (playing) {
                    mainPlayBtnEl.style.display = 'none';
                    mainPauseBtnEl.style.display = 'inline-block';
                } else {
                    mainPlayBtnEl.style.display = 'inline-block';
                    mainPauseBtnEl.style.display = 'none';
                }
            }
        }
        // Actualizar player grande
        if (playLarge) {
            var iconL = playLarge.querySelector('i');
            if (playing) {
                iconL.classList.remove('fa-play');
                iconL.classList.add('fa-pause');
                playLarge.classList.add('playing');
                if (vizLarge) vizLarge.classList.add('active');
                if (statusEl) statusEl.textContent = '🔴 Reproduciendo en vivo...';
            } else {
                iconL.classList.remove('fa-pause');
                iconL.classList.add('fa-play');
                playLarge.classList.remove('playing');
                if (vizLarge) vizLarge.classList.remove('active');
                if (statusEl) statusEl.textContent = 'En vivo — Haz clic para escuchar';
            }
        }
    }

    // Función para reproducir directo
    function playStream(url, isFallback) {
        radioAudio.src = url;
        usingFallback = isFallback;
        radioAudio.play().catch(function (err) {
            if (statusEl) statusEl.textContent = '⚠️ No se pudo conectar. Intenta más tarde.';
            isPlaying = false;
            updateRadioUI(false);
        });
    }

    function toggleRadio() {
        if (isPlaying) {
            radioAudio.pause();
            isPlaying = false;
        } else {
            if (statusEl) statusEl.textContent = '⏳ Conectando...';
            isPlaying = true;
            usingFallback = false;

            // Intentar reproducir la URL configurada
            radioAudio.src = radioStreamURL;
            // limpiar timer previo
            if (playWatchTimer) { clearTimeout(playWatchTimer); playWatchTimer = null; }
            radioAudio.play().catch(function () {
                // Si falla la reproducción, intentar fallback si existe
                if (radioFallbackURL && !usingFallback) {
                    usingFallback = true;
                    radioAudio.src = radioFallbackURL;
                    radioAudio.play().catch(function () {
                        if (statusEl) statusEl.textContent = '⚠️ No se pudo conectar. Actualiza la URL del stream.';
                        isPlaying = false;
                        updateRadioUI(false);
                    });
                } else {
                    if (statusEl) statusEl.textContent = '⚠️ No se pudo conectar. Actualiza la URL del stream.';
                    isPlaying = false;
                    updateRadioUI(false);
                }
            });
            // si no pasa a 'playing' en 8s, intentar fallback automáticamente
            playWatchTimer = setTimeout(function () {
                if (!radioAudio || !isPlaying) return;
                if (!radioAudio.paused && !radioAudio.ended) return; // ya está sonando
                if (radioFallbackURL && !usingFallback) {
                    usingFallback = true;
                    try { radioAudio.src = radioFallbackURL; radioAudio.play().catch(function(){ if (statusEl) statusEl.textContent = '⚠️ No se pudo conectar al fallback.'; }); }
                    catch (e) { if (statusEl) statusEl.textContent = '⚠️ Error al cambiar a fallback.'; }
                } else {
                    if (statusEl) statusEl.textContent = '⚠️ No se pudo conectar. Actualiza la URL del stream.';
                    isPlaying = false;
                    updateRadioUI(false);
                }
            }, 8000);
        }
        updateRadioUI(isPlaying);
    }

    if (playBtn) playBtn.addEventListener('click', toggleRadio);
    // También enlazar los botones principales si existen
    if (mainPlayBtnEl) mainPlayBtnEl.addEventListener('click', toggleRadio);
    if (mainPauseBtnEl) mainPauseBtnEl.addEventListener('click', toggleRadio);
    if (playLarge) playLarge.addEventListener('click', toggleRadio);

    // Eventos de audio
    radioAudio.addEventListener('playing', function () {
        isPlaying = true;
        updateRadioUI(true);
        if (usingFallback) {
            if (statusEl) statusEl.textContent = '🔴 Reproduciendo radio cristiana en vivo';
        }
        if (playWatchTimer) { clearTimeout(playWatchTimer); playWatchTimer = null; }
    });
    radioAudio.addEventListener('pause', function () {
        isPlaying = false;
        updateRadioUI(false);
        if (playWatchTimer) { clearTimeout(playWatchTimer); playWatchTimer = null; }
    });
    radioAudio.addEventListener('error', function () {
        // Si falla el stream actual, intentar fallback o pedir al usuario una URL nueva
        if (isPlaying) {
            if (radioFallbackURL && !usingFallback) {
                usingFallback = true;
                radioAudio.src = radioFallbackURL;
                radioAudio.play().catch(function () {
                    if (statusEl) statusEl.textContent = '⚠️ Error de conexión al stream';
                    isPlaying = false;
                    updateRadioUI(false);
                });
                return;
            }
            if (statusEl) statusEl.textContent = '⚠️ Error de conexión al stream';
            isPlaying = false;
            updateRadioUI(false);
            // Ofrecer al usuario actualizar la URL del stream con doble clic en el botón
            // (mensaje informativo)
            if (playBtn) {
                playBtn.title = 'Doble clic para cambiar la URL del stream';
            }
        }
    });

    // Permitir al usuario cambiar la URL del stream con doble clic en el botón de play
    if (playBtn) {
        playBtn.addEventListener('dblclick', function () {
            var newUrl = window.prompt('Ingrese la URL del stream de audio (ej. https://mi-stream.com/stream.mp3):', radioStreamURL || '');
            if (newUrl) {
                radioStreamURL = newUrl.trim();
                localStorage.setItem('oremrd_stream_url', radioStreamURL);
                alert('URL del stream actualizada. Haz clic en reproducir para conectar.');
            }
        });
    }
    // Aplicar la URL forzada al elemento de audio si existe
    try {
        if (radioAudio && radioAudio.tagName && radioAudio.tagName.toLowerCase() === 'audio') {
            radioAudio.src = radioStreamURL;
        }
    } catch (e) { /* noop */ }
    radioAudio.addEventListener('waiting', function () {
        if (statusEl) statusEl.textContent = '⏳ Cargando stream...';
    });

    // Volume controls - Todos los sliders de volumen
    document.querySelectorAll('.volume-slider, .volume-slider-large, #volumeSlider').forEach(function (slider) {
        slider.addEventListener('input', function () {
            radioAudio.volume = this.value / 100;
            // Sincronizar todos los sliders
            document.querySelectorAll('.volume-slider, .volume-slider-large, #volumeSlider').forEach(function (s) {
                s.value = slider.value;
            });
            // Actualizar icono de volumen
            var volumeIcons = document.querySelectorAll('.volume-control i, .radio-volume-large i');
            volumeIcons.forEach(function (icon) {
                icon.className = 'fas ' + (slider.value == 0 ? 'fa-volume-mute' : slider.value < 50 ? 'fa-volume-down' : 'fa-volume-up');
            });
        });
    });

    // ===== BUSCADOR FUNCIONAL =====
    var searchToggle = document.getElementById('searchToggle');
    var searchOverlay = document.getElementById('searchOverlay');
    var searchClose = document.getElementById('searchClose');
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');

    // Base de datos de posts para búsqueda
    var postsDB = [
        {
            title: 'DIOS NO HA TERMINADO CONTIGO',
            excerpt: 'A veces sentimos que hemos fallado demasiado, que no estamos donde deberíamos, o que no somos lo suficientemente fuertes. Pero déjame decirte algo con toda certeza: Dios no ha terminado contigo.',
            url: 'post1.html',
            date: 'abril 30, 2025',
            image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=150&h=100&fit=crop'
        },
        {
            title: 'LA DIGNIDAD DE UN CRISTIANO ESTÁ EN SU HONESTIDAD',
            excerpt: 'La punta de lanza de todo buen cristiano debe ser siempre un testimonio de alta integridad. Más allá de lo que decimos con palabras, nuestra vida debe hablar con hechos.',
            url: 'post2.html',
            date: 'abril 30, 2025',
            image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=150&h=100&fit=crop'
        },
        {
            title: 'TODAVÍA NO ES NECESARIAMENTE EL FINAL',
            excerpt: 'Por experiencia propia sé lo decepcionante que puede ser confiar en el Señor y, aun así, ver que todo parece haberse perdido. Que las puertas se cierran, que los sueños mueren.',
            url: 'post3.html',
            date: 'abril 30, 2025',
            image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&h=100&fit=crop'
        },
        {
            title: 'LA INTEGRIDAD, EL VALOR MÁS GRANDE',
            excerpt: 'David se presenta delante de Dios para defender su causa, y no lo hace basándose en la cantidad de oraciones que ha hecho, sino que declara con confianza su integridad.',
            url: 'post4.html',
            date: 'abril 30, 2025',
            image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=150&h=100&fit=crop'
        }
    ];

    if (searchToggle) {
        searchToggle.addEventListener('click', function (e) {
            e.preventDefault();
            searchOverlay.classList.add('active');
            setTimeout(function () { searchInput.focus(); }, 300);
        });
    }
    if (searchClose) {
        searchClose.addEventListener('click', function () {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function (e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });
    }

    // Buscar con ESC para cerrar
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.innerHTML = '<p class="search-hint">Escribe al menos 2 caracteres para buscar...</p>';
                return;
            }

            var results = postsDB.filter(function (post) {
                return post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query);
            });

            if (results.length === 0) {
                searchResults.innerHTML = '<p class="search-no-results"><i class="fas fa-search"></i> No se encontraron resultados para "<strong>' + query + '</strong>"</p>';
                return;
            }

            var html = '<p class="search-count">' + results.length + ' resultado(s) encontrado(s):</p>';
            results.forEach(function (post) {
                html += '<a href="' + post.url + '" class="search-result-item">';
                html += '<img src="' + post.image + '" alt="' + post.title + '">';
                html += '<div class="search-result-info">';
                html += '<h4>' + highlightText(post.title, query) + '</h4>';
                html += '<p>' + highlightText(post.excerpt.substring(0, 120) + '...', query) + '</p>';
                html += '<span class="search-result-date"><i class="far fa-calendar-alt"></i> ' + post.date + '</span>';
                html += '</div></a>';
            });
            searchResults.innerHTML = html;
        });
    }

    function highlightText(text, query) {
        var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // ===== SISTEMA DE COMENTARIOS (localStorage) =====
    var commentForm = document.getElementById('commentForm');
    var commentsContainer = document.getElementById('commentsContainer');
    var commentCount = document.getElementById('commentCount');

    function getPageId() {
        return window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    }

    function loadComments() {
        if (!commentsContainer) return;
        var pageId = getPageId();
        var comments = JSON.parse(localStorage.getItem('oremrd_comments_' + pageId) || '[]');

        if (commentCount) commentCount.textContent = comments.length;

        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="no-comments"><i class="far fa-comment"></i> Sé el primero en comentar</p>';
            return;
        }

        var html = '';
        comments.forEach(function (c, index) {
            var initial = c.name.charAt(0).toUpperCase();
            var timeAgo = getTimeAgo(new Date(c.date));
            html += '<div class="comment-item" style="animation-delay: ' + (index * 0.1) + 's">';
            html += '<div class="comment-avatar">' + initial + '</div>';
            html += '<div class="comment-body">';
            html += '<div class="comment-header">';
            html += '<strong class="comment-author">' + escapeHtml(c.name) + '</strong>';
            html += '<span class="comment-date" title="' + new Date(c.date).toLocaleString('es-ES') + '">' + timeAgo + '</span>';
            html += '</div>';
            html += '<p class="comment-text">' + escapeHtml(c.text) + '</p>';
            html += '<div class="comment-actions">';
            html += '<button class="comment-like-btn" data-index="' + index + '"><i class="' + (c.liked ? 'fas' : 'far') + ' fa-heart"></i> <span>' + (c.likes || 0) + '</span></button>';
            html += '<button class="comment-reply-btn" data-name="' + escapeHtml(c.name) + '"><i class="fas fa-reply"></i> Responder</button>';
            html += '</div>';
            html += '</div></div>';
        });
        commentsContainer.innerHTML = html;

        // Event listeners para likes
        commentsContainer.querySelectorAll('.comment-like-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.dataset.index);
                var comments = JSON.parse(localStorage.getItem('oremrd_comments_' + getPageId()) || '[]');
                if (comments[idx]) {
                    comments[idx].liked = !comments[idx].liked;
                    comments[idx].likes = (comments[idx].likes || 0) + (comments[idx].liked ? 1 : -1);
                    localStorage.setItem('oremrd_comments_' + getPageId(), JSON.stringify(comments));
                    loadComments();
                }
            });
        });

        // Event listeners para responder
        commentsContainer.querySelectorAll('.comment-reply-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var name = this.dataset.name;
                var textarea = document.getElementById('commentText');
                if (textarea) {
                    textarea.value = '@' + name + ' ';
                    textarea.focus();
                    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    if (commentForm) {
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var nameInput = document.getElementById('commentName');
            var textInput = document.getElementById('commentText');
            var name = nameInput.value.trim();
            var text = textInput.value.trim();

            if (!name || !text) {
                showNotification('Por favor completa todos los campos', 'warning');
                return;
            }

            if (text.length < 3) {
                showNotification('El comentario es muy corto', 'warning');
                return;
            }

            var pageId = getPageId();
            var comments = JSON.parse(localStorage.getItem('oremrd_comments_' + pageId) || '[]');
            comments.push({
                name: name,
                text: text,
                date: new Date().toISOString(),
                likes: 0,
                liked: false
            });
            localStorage.setItem('oremrd_comments_' + pageId, JSON.stringify(comments));

            // Guardar nombre para futuros comentarios
            localStorage.setItem('oremrd_commenter_name', name);

            nameInput.value = '';
            textInput.value = '';
            loadComments();
            showNotification('¡Comentario publicado! 🙏', 'success');
        });

        // Pre-llenar nombre si ya comentó antes
        var savedName = localStorage.getItem('oremrd_commenter_name');
        var nameInput = document.getElementById('commentName');
        if (savedName && nameInput) nameInput.value = savedName;
    }

    loadComments();

    // ===== NEWSLETTER SUBSCRIPTION =====
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = this.querySelector('input[type="email"]');
            var email = emailInput.value.trim();

            if (!email || !email.includes('@')) {
                showNotification('Ingresa un email válido', 'warning');
                return;
            }

            var subs = JSON.parse(localStorage.getItem('oremrd_subscribers') || '[]');
            if (subs.includes(email)) {
                showNotification('Este email ya está suscrito', 'info');
                return;
            }

            subs.push(email);
            localStorage.setItem('oremrd_subscribers', JSON.stringify(subs));
            emailInput.value = '';
            showNotification('¡Suscripción exitosa! Dios te bendiga 🙏', 'success');

            // Actualizar contador
            var subCount = document.getElementById('subscriberCount');
            if (subCount) subCount.textContent = subs.length;
        });

        // Mostrar contador
        var subCount = document.getElementById('subscriberCount');
        if (subCount) {
            var subs = JSON.parse(localStorage.getItem('oremrd_subscribers') || '[]');
            subCount.textContent = subs.length;
        }
    }

    // ===== CONTACT FORM =====
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = document.getElementById('contactName').value.trim();
            var email = document.getElementById('contactEmail').value.trim();
            var message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                showNotification('Completa todos los campos', 'warning');
                return;
            }

            // Guardar mensaje en localStorage
            var messages = JSON.parse(localStorage.getItem('oremrd_messages') || '[]');
            messages.push({ name: name, email: email, message: message, date: new Date().toISOString() });
            localStorage.setItem('oremrd_messages', JSON.stringify(messages));

            // También abrir mailto
            var mailtoURL = 'mailto:quiricojuanalexander@gmail.com?subject=Mensaje de ' + encodeURIComponent(name) + '&body=' + encodeURIComponent('De: ' + name + '\nEmail: ' + email + '\n\n' + message);
            window.open(mailtoURL, '_blank');

            contactForm.reset();
            showNotification('¡Mensaje enviado! Te contactaremos pronto 📧', 'success');
        });
    }

    // ===== SHARE BUTTONS REALES =====
    document.querySelectorAll('.share-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var pageURL = encodeURIComponent(window.location.href);
            var pageTitle = encodeURIComponent(document.title);
            var url = '';

            if (this.classList.contains('facebook')) {
                url = 'https://www.facebook.com/sharer.php?u=' + pageURL;
            } else if (this.classList.contains('twitter')) {
                url = 'https://twitter.com/intent/tweet?url=' + pageURL + '&text=' + pageTitle;
            } else if (this.classList.contains('whatsapp')) {
                url = 'https://api.whatsapp.com/send?text=' + pageTitle + '%20' + pageURL;
            } else if (this.classList.contains('pinterest')) {
                var img = document.querySelector('.post-image img');
                var imgURL = img ? encodeURIComponent(img.src) : '';
                url = 'https://www.pinterest.com/pin/create/button/?url=' + pageURL + '&media=' + imgURL + '&description=' + pageTitle;
            } else if (this.classList.contains('email-share')) {
                url = 'mailto:?subject=' + pageTitle + '&body=' + pageURL;
            } else if (this.classList.contains('copy-link')) {
                navigator.clipboard.writeText(window.location.href).then(function () {
                    showNotification('¡Enlace copiado! 📋', 'success');
                });
                return;
            }

            if (url) window.open(url, '_blank', 'width=600,height=400,scrollbars=yes');
        });
    });

    // ===== READING PROGRESS BAR =====
    var progressBar = document.getElementById('readingProgress');
    if (progressBar) {
        window.addEventListener('scroll', function () {
            var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = (window.scrollY / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    // ===== READING TIME ESTIMATE =====
    var readingTimeEl = document.getElementById('readingTime');
    if (readingTimeEl) {
        var postBody = document.querySelector('.post-body');
        if (postBody) {
            var text = postBody.textContent || '';
            var wordCount = text.trim().split(/\s+/).length;
            var minutes = Math.max(1, Math.ceil(wordCount / 200));
            readingTimeEl.textContent = minutes + ' min de lectura';
        }
    }

    // ===== SCROLL HEADER SHADOW =====
    var header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.style.boxShadow = window.scrollY > 10 ? '0 2px 15px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.3)';
        });
    }

    // ===== SCROLL ANIMATIONS =====
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.post-card, .widget, .feature-item, .schedule-item, .comment-item, .about-section').forEach(function (el) {
        el.classList.add('animate-target');
        observer.observe(el);
    });

    // ===== BACK TO TOP =====
    var backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function () {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== COOKIE CONSENT =====
    if (!localStorage.getItem('oremrd_cookies_accepted')) {
        var cookieBanner = document.createElement('div');
        cookieBanner.className = 'cookie-banner';
        cookieBanner.innerHTML = '<div class="cookie-content"><i class="fas fa-cookie-bite"></i><p>Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestro uso de cookies.</p><button class="cookie-accept">Aceptar</button></div>';
        document.body.appendChild(cookieBanner);

        setTimeout(function () { cookieBanner.classList.add('visible'); }, 1000);

        cookieBanner.querySelector('.cookie-accept').addEventListener('click', function () {
            localStorage.setItem('oremrd_cookies_accepted', 'true');
            cookieBanner.classList.remove('visible');
            setTimeout(function () { cookieBanner.remove(); }, 500);
        });
    }

    // ===== IMAGE LAZY LOADING =====
    if ('IntersectionObserver' in window) {
        var imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    imgObserver.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(function (img) {
            imgObserver.observe(img);
        });
    }

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();

        var notification = document.createElement('div');
        notification.className = 'notification notification-' + (type || 'info');

        var icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', error: 'fa-times-circle' };
        notification.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
        document.body.appendChild(notification);

        setTimeout(function () { notification.classList.add('visible'); }, 100);
        setTimeout(function () {
            notification.classList.remove('visible');
            setTimeout(function () { notification.remove(); }, 500);
        }, 3500);
    }

    // ===== HELPER FUNCTIONS =====
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getTimeAgo(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Justo ahora';
        var minutes = Math.floor(seconds / 60);
        if (minutes < 60) return 'Hace ' + minutes + ' min';
        var hours = Math.floor(minutes / 60);
        if (hours < 24) return 'Hace ' + hours + 'h';
        var days = Math.floor(hours / 24);
        if (days < 30) return 'Hace ' + days + ' día' + (days > 1 ? 's' : '');
        var months = Math.floor(days / 30);
        if (months < 12) return 'Hace ' + months + ' mes' + (months > 1 ? 'es' : '');
        return date.toLocaleDateString('es-ES');
    }

    // ===== PRINT BUTTON =====
    var printBtn = document.getElementById('printPost');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    // ===== TEXT SIZE CONTROLS =====
    var increaseFontBtn = document.getElementById('increaseFont');
    var decreaseFontBtn = document.getElementById('decreaseFont');
    var currentFontSize = 15;

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', function () {
            if (currentFontSize < 22) {
                currentFontSize += 1;
                document.querySelector('.post-body').style.fontSize = currentFontSize + 'px';
            }
        });
    }
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', function () {
            if (currentFontSize > 12) {
                currentFontSize -= 1;
                document.querySelector('.post-body').style.fontSize = currentFontSize + 'px';
            }
        });
    }

    // ===== DARK MODE TOGGLE =====
    var darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        var isDark = localStorage.getItem('oremrd_dark_mode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');
        updateDarkModeIcon(isDark);

        darkModeBtn.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('oremrd_dark_mode', isDark);
            updateDarkModeIcon(isDark);
        });
    }

    function updateDarkModeIcon(isDark) {
        if (!darkModeBtn) return;
        var icon = darkModeBtn.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Aplicar dark mode guardado
    if (localStorage.getItem('oremrd_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // ===== VISIT COUNTER (countapi.xyz) =====
    (function () {
        var COUNT_NAMESPACE = '3f3f319b5f5d4ee5938609f9fe0141b0c4c8a2065c34c499d9221165';

        function showVisitCount(count) {
            var id = 'visit-counter';
            var el = document.getElementById(id);
            if (!el) {
                var footer = document.querySelector('footer');
                if (!footer) {
                    footer = document.createElement('footer');
                    footer.className = 'site-footer';
                    document.body.appendChild(footer);
                }
                el = document.createElement('div');
                el.id = id;
                el.className = 'visit-counter';
                footer.appendChild(el);
            }
            el.textContent = 'Visitas: ' + (typeof count === 'number' ? count : '-');
        }

        function registerVisit() {
            try {
                var key = getPageId();
                var url = 'https://api.countapi.xyz/hit/' + encodeURIComponent(COUNT_NAMESPACE) + '/' + encodeURIComponent(key);
                fetch(url, { cache: 'no-store' })
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        if (data && typeof data.value !== 'undefined') showVisitCount(data.value);
                    })
                    .catch(function () { showVisitCount(null); });
            } catch (e) {
                console.error('Visit counter error', e);
            }
        }

        registerVisit();
    })();

}); // fin DOMContentLoaded
