document.addEventListener('DOMContentLoaded', () => {
    let contadorCliques = 0;
    const metaCliques = 10;
    let faseAtual = 'olho'; 
    let detectorColisao = null; 
    let minionsFinalizados = 0;
    const maxMinions = 5;
    let limiteParadaAtual = 0; 
    let cliquesMosca1 = 0;
    let cliquesMosca2 = 0;
    const metaMoscas = 10;


    const olho = document.getElementById('olho');
    const displayContador = document.getElementById('contador-visual');
    const mosca = document.getElementById('mosca');
    const mao = document.getElementById('mao');
    const janela = document.getElementById('janela-recompensa');
    const imagemModal = janela.querySelector('.imagem-recompensa');
    const btnFecharModal = janela.querySelector('.fechar-modal');

    // --- REFERÊNCIAS GALERIA ---
    const btnColecao = document.getElementById('btn-colecao');
    const galeriaContainer = document.getElementById('container-iframe-galeria');

    // --- CONTAINER DO JOGO ---
    const gameContainer = document.getElementById('game-container');
    
    // --- LÓGICA DA GALERIA IN-GAME ---
    if (btnColecao) {
        btnColecao.addEventListener('click', () => {
            if (galeriaContainer) {
                galeriaContainer.style.display = 'block';
                const iframe = galeriaContainer.querySelector('iframe');
                if (iframe) {
                    iframe.contentWindow.postMessage('atualizarGaleria', '*'); // Manda a galeria se atualizar
                }
            }
        });
    }

    window.addEventListener('message', (event) => {
        if (event.data === 'fecharGaleria' && galeriaContainer) {
            galeriaContainer.style.display = 'none';
        }
    });

    // --- FASE 1: O OLHO ---
    olho.addEventListener('click', () => {
        if (faseAtual === 'olho') {
            contadorCliques++;
            if (displayContador) displayContador.innerText = `${contadorCliques} / ${metaCliques}`;
            olho.classList.add('olho-agitado'); 
            setTimeout(() => olho.classList.remove('olho-agitado'), 1500);
            if (contadorCliques >= metaCliques) {
                exibirRecompensa('assets/diario-fernando.png');
                contadorCliques = 0;
                faseAtual = 'recompensa_diario'; 
            }
        }
    });

    // --- FASE 2: A MOSCA ---
    function ativarFaseMosca() {
        contadorCliques = 0;
        if (displayContador) displayContador.innerText = `0 / ${metaCliques}`;
        mosca.style.display = 'block';
        faseAtual = 'mosca';
    }

    mosca.addEventListener('click', () => {
        if (faseAtual === 'mosca') {
            contadorCliques++;
            if (displayContador) displayContador.innerText = `${contadorCliques} / ${metaCliques}`;
            mosca.style.width = '80px'; 
            setTimeout(() => { if (mosca.style.display !== 'none') mosca.style.width = '100px'; }, 200); 
            if (contadorCliques >= metaCliques) {
                exibirRecompensa('assets/lucia-ficha.png');
                contadorCliques = 0;
                faseAtual = 'recompensa_lucia';
            }
        }
    });

    // --- FASE 3: A MÃO ---
    function iniciarFaseMao() {
        faseAtual = 'esperando_bote';
        mao.style.display = 'block';
        mao.src = 'assets/mao-aberta.png';
        mao.classList.add('mao-descendo');

        mao.addEventListener('animationend', () => {
            mao.classList.remove('mao-descendo');
            mao.style.transform = 'translate(-50%, -10%)'; 
            detectorColisao = setInterval(verificarColisao, 50);
        }, { once: true });
    }

    function verificarColisao() {
        const rectMosca = mosca.getBoundingClientRect();
        const rectMao = mao.getBoundingClientRect();
        const encostou = !(rectMosca.right < rectMao.left || rectMosca.left > rectMao.right || 
                         rectMosca.bottom < rectMao.top || rectMosca.top > rectMao.bottom);

        if (encostou) {
            clearInterval(detectorColisao);
            mao.src = 'assets/mao-fechada.png';
            mosca.style.display = 'none';
            faseAtual = 'mao_fechada';
            contadorCliques = 0;
            if (displayContador) displayContador.innerText = `0 / ${metaCliques}`;
        }
    }

    mao.addEventListener('click', () => {
        if (faseAtual === 'mao_fechada') {
            contadorCliques++;
            if (displayContador) displayContador.innerText = `${contadorCliques} / ${metaCliques}`;
            mao.classList.add('mao-vibrando');
            setTimeout(() => mao.classList.remove('mao-vibrando'), 100);

            if (contadorCliques >= metaCliques) {
                mao.src = 'assets/mao-aberta-mosca.png';
                faseAtual = 'finalizado';
                mao.classList.remove('mao-vibrando');
            }
        } 
        else if (faseAtual === 'finalizado') {
            mao.src = 'assets/mao-sem-mosca.png';
            mosca.style.display = 'block';
            mosca.style.left = '70%'; 
            mosca.style.top = '45%'; 
            mosca.style.animation = 'none';
            void mosca.offsetWidth; 
            mosca.classList.add('mosca-caindo');
            
            faseAtual = 'transicao_minion';

            setTimeout(() => {
                mao.src = 'assets/mao-descansando.png';
                const rectMao = mao.getBoundingClientRect();
                const rectContainer = gameContainer.getBoundingClientRect();
                limiteParadaAtual = (rectMao.right - rectContainer.left) - 40; 
                exibirRecompensa('assets/recompensa3.png');
            }, 1000);
        }
    });

    // --- FASE 4: MECÂNICA DOS MINIONS (ESMAGAMENTO) ---
    function criarMinion() {
        if (minionsFinalizados >= maxMinions) return;

        const minion = document.createElement('img');
        minion.src = 'assets/minion-normal.png';
        minion.className = 'minion';
        minion.style.left = '15px'; 
        minion.dataset.parado = "true"; 
        gameContainer.appendChild(minion);

        const gerenciarPiscada = () => {
            if (minion.dataset.parado === "true") {
                minion.src = 'assets/minion-piscando.png';
                setTimeout(() => {
                    if (minion.dataset.parado === "true") minion.src = 'assets/minion-normal.png';
                }, 250);
            }
        };
        let piscaInterval = setInterval(gerenciarPiscada, 3000 + Math.random() * 2000);

        minion.addEventListener('click', () => {
            const larguraMinion = minion.offsetWidth;
            const posicaoAtual = minion.offsetLeft;

            if (posicaoAtual < limiteParadaAtual) {
                minion.dataset.parado = "false"; 
                minion.src = 'assets/minion-empurrada.png';
                
                let novaPosicao = posicaoAtual + 45; 

                if (novaPosicao >= limiteParadaAtual) {
                    novaPosicao = limiteParadaAtual;
                    minion.style.pointerEvents = 'none'; 
                    minion.dataset.parado = "true"; 
                    
                    limiteParadaAtual = novaPosicao - (larguraMinion * 0.5);
                    minionsFinalizados++;

                    if (minionsFinalizados < maxMinions) {
                        setTimeout(criarMinion, 500);
                    } else {
                        setTimeout(iniciarEsmagamentoFinal, 800);
                    }
                }

                minion.style.left = novaPosicao + 'px';

                setTimeout(() => {
                    minion.src = 'assets/minion-normal.png';
                    if (minion.style.pointerEvents !== 'none') {
                        minion.dataset.parado = "true";
                    }
                }, 300);
            }
        });
    }

    function iniciarEsmagamentoFinal() {
        const todosMinions = document.querySelectorAll('.minion');
        mao.src = 'assets/mao-fechada.png';
        todosMinions.forEach(m => {
            m.src = 'assets/minion-socorro.png';
            m.dataset.parado = "false"; 
        });

        setTimeout(() => {
            mao.classList.add('mao-esmagando');
            setTimeout(() => {
                todosMinions.forEach(m => m.style.display = 'none');
                mao.src = 'assets/mao-fechada-esmagadas.png';
                mao.classList.add('mao-vibrando');
                setTimeout(() => {
                    mao.classList.remove('mao-vibrando');
                    exibirRecompensa('assets/recompensa4.png');
                }, 200);
            }, 400); 
        }, 800);
    }

    // --- FASE 5: ROLO DE LINHA ---
    function iniciarFaseEntrega(config) {

    faseAtual = config.nomeFase;

    const minionGrupo = document.createElement('img');
    minionGrupo.src = config.imgAndando;
    minionGrupo.className = 'minion minion-grupo';
    minionGrupo.style.left = '15px'; 
    minionGrupo.style.opacity = '1';
    gameContainer.appendChild(minionGrupo);

    minionGrupo.addEventListener('click', () => {

        const rectMao = mao.getBoundingClientRect();
        const rectContainer = gameContainer.getBoundingClientRect();
        const centroMao = (rectMao.left - rectContainer.left) + (rectMao.width / 2);
        const limiteCentralizado = centroMao - (minionGrupo.offsetWidth / 2);

        const posicaoAtual = minionGrupo.offsetLeft;

        if (posicaoAtual < limiteCentralizado) {

            minionGrupo.src = config.imgEmpurrando;

            let novaPosicao = posicaoAtual + 45; 
            if (novaPosicao >= limiteCentralizado) {
                novaPosicao = limiteCentralizado;
            }

            minionGrupo.style.left = novaPosicao + 'px';

            setTimeout(() => {

                minionGrupo.src = config.imgAndando;

                if (novaPosicao >= limiteCentralizado) {
                    minionGrupo.style.pointerEvents = 'none';
                    setTimeout(() => finalizarEntrega(minionGrupo, config), 500);
                }

            }, 300);
        }
    });
    }

    function finalizarEntrega(minion, config) {

    minion.src = config.imgFinalMinions;
    mao.src = config.imgMaoItem;
    mao.classList.add('mao-entregando-item');

    setTimeout(() => {
        minion.style.transition = 'opacity 0.8s ease';
        minion.style.opacity = '0';
        setTimeout(() => minion.remove(), 800);
    }, 1500);

    setTimeout(() => {
        mao.src = 'assets/mao-descansando.png';
    }, 1000);

    setTimeout(() => {
        mao.classList.remove('mao-entregando-item');
        exibirRecompensa(config.recompensaFinal);
    }, 2000);
}
    // --- FASE 6: 2 MOSCAS ---
   function iniciarFaseMultiplasMoscas(quantidade, recompensaFinal) {

    faseAtual = 'multiplas_moscas';

    const metas = [];
    const cliques = [];
    const moscas = [];

    displayContador.innerText = '';

    for (let i = 0; i < quantidade; i++) {

        metas[i] = 10;
        cliques[i] = 0;

        const novaMosca = document.createElement('img');
        novaMosca.src = 'assets/mosca.png';
        novaMosca.className = `mosca-dupla mosca-${i}`;

        novaMosca.style.left = (20 + (i * 20)) + '%';
        novaMosca.style.top = (30 + (i * 10)) + '%';

        if (i % 2 === 0) {
            novaMosca.style.animation = `vooMosca1 ${5 + i}s linear infinite`;
        } else {
            novaMosca.style.animation = `vooMosca2 ${6 + i}s linear infinite`;
        }

        gameContainer.appendChild(novaMosca);
        moscas.push(novaMosca);

        novaMosca.addEventListener('click', () => {

            if (faseAtual !== 'multiplas_moscas') return;

            if (cliques[i] < metas[i]) {
                cliques[i]++;
                atualizarContador();
            }

            verificarFim();
        });
    }

    function atualizarContador() {
        displayContador.innerHTML = '';
        for (let i = 0; i < quantidade; i++) {
            const span = document.createElement('span');
            span.innerText = `Mosca ${i+1}: ${cliques[i]}/${metas[i]}`;
            displayContador.appendChild(span);
        }
    }

    function verificarFim() {

        const todasCompletas = cliques.every((valor, i) => valor >= metas[i]);

        if (todasCompletas) {

            faseAtual = 'fim_multiplas';

            moscas.forEach(m => m.remove());

            contadorCliques = 0;
            displayContador.innerText = `0 / ${metaCliques}`;

            exibirRecompensa(recompensaFinal);
        }
    }

    atualizarContador();
}

    // --- FASE FINAL: DIÁLOGO VISUAL NOVEL ---
    function iniciarFaseFinalDialogo() {
        faseAtual = 'dialogo_final';
        
        mao.style.display = 'none';

        const pendulo = document.querySelector('.pendulo-container');
        if(pendulo) pendulo.classList.add('pendulo-subindo');

        gameContainer.classList.add('tremor-tela');

        const animacaoFinal = document.createElement('img');
        animacaoFinal.id = 'animacao-final';
        animacaoFinal.src = 'assets/animacao1.png';
        animacaoFinal.classList.add('animacao-descendo');
        gameContainer.appendChild(animacaoFinal);

        const dialogos = [
            "Muita fome…",
            "Você pode não me alimentar, mas isso não vai fazer minha fome sumir.",
            "Ela vai só aumentar até começar a se alimentar sozinha…",
            "E ela vai começar pelo seu estômago.",
            "Quando ela devorar tudo dentro de você, a minha fome será sua.",
            "Quando o vazio for maior que seu corpo, você não vai mais conseguir distinguir a comida da lavagem",
            "a verdade da mentira",
            "a glória do pecado",
            "você de você.",
            "Então, cuidado… Porque a fome cega."
        ];

        const dialogoBox = document.getElementById('dialogo-container');
        const textoBox = document.getElementById('texto-dialogo');
        let indice = 0;
        let typingInterval;
        let isTyping = false;
        let textoAtual = "";
        let animacaoConcluida = false;

        function typeText(text) {
            textoBox.innerText = "";
            textoAtual = text;
            isTyping = true;
            let i = 0;
            clearInterval(typingInterval);
            
            typingInterval = setInterval(() => {
                textoBox.innerText += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(typingInterval);
                    isTyping = false;
                }
            }, 40);
        }

        dialogoBox.style.display = 'block';
        typeText(dialogos[0]);

        setTimeout(() => {
            animacaoFinal.src = 'assets/animacao2.png';
            
            // Espera 2 segundos na animacao2
            setTimeout(() => {
                animacaoFinal.src = 'assets/animacao3.png';
                animacaoConcluida = true;
            }, 2000);
        }, 2500);

        dialogoBox.addEventListener('click', () => {
            if (isTyping) {
                clearInterval(typingInterval);
                textoBox.innerText = textoAtual;
                isTyping = false;
            } else {
                if (indice === 0 && !animacaoConcluida) return;

                indice++;

                if (indice > 0) {
                    gameContainer.classList.remove('tremor-tela');
                }

                if (indice < dialogos.length) {
                    typeText(dialogos[indice]);
                } else {
                    dialogoBox.style.display = 'none';
                    gameContainer.style.transition = "opacity 3s";
                    gameContainer.style.opacity = "0";
                    setTimeout(() => {
                        exibirRecompensa('assets/recompensa10.png');
                    }, 3000);
                }
            }
        });
    }

    // --- SISTEMA DE RECOMPENSAS ---
    function exibirRecompensa(caminho) {
        const titulos = {
            'assets/diario-fernando.png': 'O Diário do Padre Fernando.',
            'assets/lucia-ficha.png': 'Menina Cabeçuda Sem Mãe e Sem Pai.',
            'assets/recompensa3.png': 'Passível de Castigo.',
            'assets/recompensa4.png': 'Vai ser tão lindo!',
            'assets/recompensa5.png': 'Era uma vez...',
            'assets/recompensa6.png': 'Elas não conseguem gritar.',
            'assets/recompensa7.png': 'Prontuário.',
            'assets/recompensa8.png': 'O Diabo.',
            'assets/recompensa9.png': 'Você nunca esteve sozinho (infelizmente, eu acho).',
            'assets/recompensa10.png': 'Complacência.'
        };

        if (imagemModal) imagemModal.src = caminho;
        
        const pDescricao = janela.querySelector('p');
        if (pDescricao) {
            pDescricao.innerText = titulos[caminho] || 'Item desbloqueado.';
        }

        janela.style.display = 'flex';
        let colecao = JSON.parse(localStorage.getItem('imagensDesbloqueadas')) || [];
        if (!colecao.includes(caminho)) {
            colecao.push(caminho);
            localStorage.setItem('imagensDesbloqueadas', JSON.stringify(colecao));
        }
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
        const imgAtual = imagemModal.src;
        janela.style.display = 'none';

        if (imgAtual.includes('diario-fernando.png')) {
            ativarFaseMosca();
        } 
        else if (imgAtual.includes('lucia-ficha.png')) {
            iniciarFaseMao();
        } 
        else if (imgAtual.includes('recompensa3.png')) {
            criarMinion();
        }
        else if (imgAtual.includes('recompensa4.png')) {
            mao.classList.remove('mao-esmagando');
            mao.src = 'assets/mao-descansando.png';
            mao.style.transform = 'translate(-50%, -10%)';
            setTimeout(() => {
            iniciarFaseEntrega({
                nomeFase: 'rolo_linha',
                imgAndando: 'assets/minions-rolo-de-linha.png',
                imgEmpurrando: 'assets/minions-rolo-de-linha2.png',
                imgFinalMinions: 'assets/minions-maos-vazias.png',
                imgMaoItem: 'assets/mao-rolo-de-linha.png',
                recompensaFinal: 'assets/recompensa5.png'
            });
        }, 100);
        }
        else if (imgAtual.includes('recompensa5.png')) {
        console.log("Chamando fase 2 moscas");
        iniciarFaseMultiplasMoscas(2, 'assets/recompensa6.png');
    }
        else if (imgAtual.includes('recompensa6.png')) {

    mao.src = 'assets/mao-descansando.png';
    mao.style.transform = 'translate(-50%, -10%)';

    setTimeout(() => {
        iniciarFaseEntrega({
            nomeFase: 'entrega_2',
            imgAndando: 'assets/minions-tesoura.png',
            imgEmpurrando: 'assets/minions-tesoura2.png',
            imgFinalMinions: 'assets/minions-maos-vazias.png',
            imgMaoItem: 'assets/mao-tesoura.png',
            recompensaFinal: 'assets/recompensa7.png'
        });
    }, 100);
}
    else if (imgAtual.includes('recompensa7.png')) {
        console.log("Chamando fase 3 moscas");
        iniciarFaseMultiplasMoscas(3, 'assets/recompensa8.png');
    }
    else if (imgAtual.includes('recompensa8.png')) {
        mao.src = 'assets/mao-descansando.png';
        mao.style.transform = 'translate(-50%, -10%)';

        setTimeout(() => {
            iniciarFaseEntrega({
                nomeFase: 'entrega_coracao',
                imgAndando: 'assets/minions-coracao.png',
                imgEmpurrando: 'assets/minions-coracao2.png',
                imgFinalMinions: 'assets/minions-coracao-maos-vazias.png',
                imgMaoItem: 'assets/mao-coracao.png',
                recompensaFinal: 'assets/recompensa9.png'
            });
        }, 100);
    }
    else if (imgAtual.includes('recompensa9.png')) {
        iniciarFaseFinalDialogo();
    }
        });
    }
});
