import { useState, useEffect } from 'react'
import './App.css'
import videoDog from './dog.gif'
import imgDogDormindo from './husky_dormindo.png'; 
import imgCasinha1 from './casinha-papelao.png';
import imgCasinha2 from './casinha-pano.png';  
import imgCasinha3 from './casinha-madeira.png'; 
import imgCasinha4 from './mansao.png';          
import imgTigela1 from './tigela-cheia.png';
import imgTigela2 from './tigela-vazia.png'; 
import imgMochila from './mochila.png'; 
import imgSacola from './sacola.png'; 

const CASINHAS = {
  1: { nome: 'Caixa de Papelão', recPorSeg: 2/60, textoLabel: '+2⚡/min', preco: 0 },
  2: { nome: 'Caminha de Pano', recPorSeg: 5/60, textoLabel: '+5⚡/min', preco: 1000 },
  3: { nome: 'Casa de Madeira', recPorSeg: 10/60, textoLabel: '+10⚡/min', preco: 10000 },
  4: { nome: 'Mansão Canina', recPorSeg: 25/60, textoLabel: '+25⚡/min', preco: 50000 }
};

const RACOES = {
  biscoito: { nome: 'Biscoito', preco: 5, saciedade: 15, felicidade: 2, icone: '🍪' },
  comum: { nome: 'Ração Comum', preco: 15, saciedade: 50, felicidade: 10, icone: '🍖' },
  premium: { nome: 'Patê Premium', preco: 50, saciedade: 100, felicidade: 40, icone: '🥩' }
};

const ACOES_TRABALHO = {
  cavar: { nome: 'Cavar Jardim', tempo: 120, energia: 15, fome: 10, sujeira: 25, recompensa: 10, icone: '🐾' }, 
  jornal: { nome: 'Buscar Jornal', tempo: 300, energia: 30, fome: 20, sujeira: 10, recompensa: 35, icone: '📰' }, 
  tesouro: { nome: 'Caçar Tesouro', tempo: 600, energia: 45, fome: 30, sujeira: 15, recompensa: 150, icone: '🗺️' }, 
  show: { nome: 'Show de Talentos', tempo: 900, energia: 60, fome: 40, sujeira: 5, recompensa: 500, icone: '🎪' } 
};

const formatarTempo = (segundos) => {
  if (segundos < 60) return `${segundos}s`;
  return `${Math.floor(segundos / 60)}m`;
}

let bloqueiaSave = false;

function App() {
  const saveAntigo = JSON.parse(localStorage.getItem('dogTycoonSave'));

  const [dogcoins, setDogcoins] = useState(saveAntigo?.dogcoins ?? 0)
  const [energia, setEnergia] = useState(saveAntigo?.energia ?? 100)
  const [fome, setFome] = useState(saveAntigo?.fome ?? 0)
  const [felicidade, setFelicidade] = useState(saveAntigo?.felicidade ?? 100)
  const [sujeira, setSujeira] = useState(saveAntigo?.sujeira ?? 0)
  
  const [acaoAtual, setAcaoAtual] = useState(saveAntigo?.acaoAtual ?? 'LIVRE')
  const [tempoFimAcao, setTempoFimAcao] = useState(saveAntigo?.tempoFimAcao ?? null)
  const [recompensaPendente, setRecompensaPendente] = useState(saveAntigo?.recompensaPendente ?? 0)
  
  const [ultimoDrain, setUltimoDrain] = useState(saveAntigo?.ultimoDrain ?? Date.now())
  const [ultimoTickGeral, setUltimoTickGeral] = useState(saveAntigo?.ultimoTickGeral ?? Date.now())
  
  const [inventarioRacoes, setInventarioRacoes] = useState(saveAntigo?.inventarioRacoes ?? { biscoito: 0, comum: 0, premium: 0 })
  const [nivelCasinha, setNivelCasinha] = useState(saveAntigo?.nivelCasinha ?? 1)
  
  const [horaServidor, setHoraServidor] = useState('Conectando...')
  const [menuAberto, setMenuAberto] = useState('NENHUM');

  useEffect(() => {
    if (saveAntigo?.acaoAtual === 'DORMINDO') {
      const segOffline = (Date.now() - saveAntigo.ultimoTickGeral) / 1000;
      setEnergia(prev => Math.min(100, prev + (CASINHAS[saveAntigo.nivelCasinha].recPorSeg * segOffline)));
    }
  }, []);

  useEffect(() => {
    if (bloqueiaSave) return;
    localStorage.setItem('dogTycoonSave', JSON.stringify({
      dogcoins, energia, fome, felicidade, sujeira, acaoAtual,
      tempoFimAcao, recompensaPendente, ultimoDrain, ultimoTickGeral, 
      inventarioRacoes, nivelCasinha
    }));
  }, [dogcoins, energia, fome, felicidade, sujeira, acaoAtual, tempoFimAcao, recompensaPendente, ultimoDrain, ultimoTickGeral, inventarioRacoes, nivelCasinha]);

  useEffect(() => {
    const loop = setInterval(() => {
      const agora = Date.now(); 
      setUltimoTickGeral(agora);

      if (agora - ultimoDrain >= 600000) { 
        setFome(prev => Math.min(100, prev + 1)); 
        setFelicidade(prev => Math.max(0, prev - 1)); 
        setUltimoDrain(agora);
      }

      if (tempoFimAcao && agora >= tempoFimAcao) {
        if (ACOES_TRABALHO[acaoAtual]) setDogcoins(prev => prev + recompensaPendente);
        if (acaoAtual === 'BANHO') setSujeira(0);
        
        setAcaoAtual('LIVRE');
        setTempoFimAcao(null);
        setRecompensaPendente(0);
      }

      if (acaoAtual === 'DORMINDO') {
        setEnergia((prev) => {
          if (prev >= 100) { setAcaoAtual('LIVRE'); return 100; }
          return Math.min(100, prev + CASINHAS[nivelCasinha].recPorSeg);
        });
      }
    }, 1000); 
    return () => clearInterval(loop);
  }, [acaoAtual, tempoFimAcao, recompensaPendente, nivelCasinha, ultimoDrain]);

  const iniciarAcao = (tipo, tempoMs, recompensa = 0, energiaCusto = 0, fomeCusto = 0, sujeiraCusto = 0) => {
    if (acaoAtual !== 'LIVRE') return;
    if (energia < energiaCusto) return alert("Energia insuficiente!");
    if (fome >= 100) return alert("Cachorro com muita fome!");

    setEnergia(prev => prev - energiaCusto);
    setFome(prev => Math.min(100, prev + fomeCusto)); 
    setSujeira(prev => Math.min(100, prev + sujeiraCusto));
    setRecompensaPendente(recompensa);
    setTempoFimAcao(Date.now() + tempoMs); 
    setAcaoAtual(tipo);
    setMenuAberto('NENHUM');
  };

  const trabalhar = (id) => {
    const a = ACOES_TRABALHO[id];
    let ganho = a.recompensa;
    if (felicidade >= 80) ganho = Math.ceil(ganho * 1.2);
    if (sujeira >= 75) ganho = Math.floor(ganho / 2);
    iniciarAcao(id, a.tempo * 1000, ganho, a.energia, a.fome, a.sujeira);
  };

  const alternarSono = () => setAcaoAtual(acaoAtual === 'DORMINDO' ? 'LIVRE' : 'DORMINDO');
  const darBanho = () => iniciarAcao('BANHO', 30000);
  
  const alimentar = (tipo) => {
    if (acaoAtual !== 'LIVRE' || inventarioRacoes[tipo] <= 0) return;
    const item = RACOES[tipo];
    setInventarioRacoes(prev => ({ ...prev, [tipo]: prev[tipo] - 1 }));
    setFome(prev => Math.max(0, prev - item.saciedade));
    setFelicidade(prev => Math.min(100, prev + item.felicidade));
    iniciarAcao('COMENDO', 30000);
  };

  const comprarRacao = (tipo) => {
    if (dogcoins >= RACOES[tipo].preco) {
      setDogcoins(prev => prev - RACOES[tipo].preco);
      setInventarioRacoes(prev => ({ ...prev, [tipo]: prev[tipo] + 1 }));
    }
  };

  const evoluirCasinha = () => {
    const prox = nivelCasinha + 1;
    if (CASINHAS[prox] && dogcoins >= CASINHAS[prox].preco) {
      setDogcoins(prev => prev - CASINHAS[prox].preco);
      setNivelCasinha(prox);
    }
  };

  const resetarJogo = () => {
    if(window.confirm("Zerar progresso?")) {
      bloqueiaSave = true;
      localStorage.removeItem('dogTycoonSave');
      window.location.reload(); 
    }
  };

  // Ajuda na acessibilidade para cliques via teclado
  const lidarComTecla = (e, acao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      acao();
    }
  };

  return (
    <div className="jogo-container">
      <div className="header-jogo">
        <h1>Dog Tycoon - Sirius 🐾</h1>
      </div>

      <div className="layout-principal">
        <div className="coluna-status">
          <h2>Status</h2>
          <div className="status-item"><div className="status-label">⚡ Energia <span>{Math.floor(energia)}%</span></div><progress className="prog-energia" value={energia} max="100"></progress></div>
          <div className="status-item"><div className="status-label">🍖 Fome <span>{fome}%</span></div><progress className="prog-fome" value={fome} max="100"></progress></div>
          <div className="status-item"><div className="status-label">❤️ Feliz <span>{felicidade}%</span></div><progress className="prog-felicidade" value={felicidade} max="100"></progress></div>
          <div className="status-item"><div className="status-label">🧽 Sujeira <span>{sujeira}%</span></div><progress className="prog-sujeira" value={sujeira} max="100"></progress></div>
        </div>

        <div className="sala-container">
          <div className="painel-moedas" aria-live="polite">💰 {dogcoins}</div>

          {tempoFimAcao && !['LIVRE', 'DORMINDO'].includes(acaoAtual) && (
            <div className="contador-central">
              <h2>{ACOES_TRABALHO[acaoAtual]?.nome || acaoAtual}</h2>
              <div className="timer-display">{Math.max(0, Math.ceil((tempoFimAcao - Date.now()) / 1000))}s</div>
            </div>
          )}

          {acaoAtual === 'DORMINDO' && (
            <div className="balao-sono">Zzz... {CASINHAS[nivelCasinha].textoLabel}</div>
          )}

          {['LIVRE', 'DORMINDO', 'COMENDO'].includes(acaoAtual) && (
            <div 
              className="sprite-clicavel sprite-dog" 
              onClick={() => setMenuAberto('ATIVIDADES')}
              onKeyDown={(e) => lidarComTecla(e, () => setMenuAberto('ATIVIDADES'))}
              role="button"
              tabIndex="0"
              aria-label="Abrir menu de atividades do cachorro"
              title="Atividades"
            >
              <img src={acaoAtual === 'DORMINDO' ? imgDogDormindo : videoDog} alt="Dog" style={{ width: acaoAtual === 'DORMINDO' ? '200px' : '300px' }} />
            </div>
          )}

          <div 
            className="sprite-clicavel sprite-tigela" 
            onClick={() => setMenuAberto('COMIDA')}
            onKeyDown={(e) => lidarComTecla(e, () => setMenuAberto('COMIDA'))}
            role="button" tabIndex="0" aria-label="Alimentar o cachorro" title="Alimentar"
          >
            <img src={acaoAtual === 'COMENDO' ? imgTigela1 : imgTigela2} alt="Tigela" style={{ width: '100px' }} />
          </div>
          
          <div 
            className="sprite-clicavel sprite-sacola" 
            onClick={() => setMenuAberto('LOJA')}
            onKeyDown={(e) => lidarComTecla(e, () => setMenuAberto('LOJA'))}
            role="button" tabIndex="0" aria-label="Abrir Pet Shop" title="Pet Shop"
          >
            <img src={imgSacola} alt="Loja" style={{ width: '150px' }} />
          </div>

          <div 
            className="sprite-clicavel sprite-mochila" 
            onClick={() => setMenuAberto('INVENTARIO')}
            onKeyDown={(e) => lidarComTecla(e, () => setMenuAberto('INVENTARIO'))}
            role="button" tabIndex="0" aria-label="Abrir Mochila" title="Inventário"
          >
            <img src={imgMochila} alt="Mochila" style={{ width: '150px' }} />
          </div>
          
          <div 
            className="sprite-clicavel sprite-casinha" 
            onClick={alternarSono} 
            onKeyDown={(e) => lidarComTecla(e, alternarSono)}
            style={{ zIndex: 20 }}
            role="button" tabIndex="0" aria-label="Colocar cachorro para dormir ou acordar" title="Casinha"
          >
             {nivelCasinha === 1 && <img src={imgCasinha1} alt="Caixa" style={{ width: '250px' }} />}
             {nivelCasinha === 2 && <img src={imgCasinha2} alt="Caminha" style={{ width: '250px' }} />}
             {nivelCasinha === 3 && <img src={imgCasinha3} alt="Madeira" style={{ width: '250px' }} />}
             {nivelCasinha === 4 && <img src={imgCasinha4} alt="Mansão" style={{ width: '300px' }} />}
          </div>

          {menuAberto !== 'NENHUM' && (
            <div className="modal-overlay" onClick={() => setMenuAberto('NENHUM')}>
              <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
                <button className="btn-fechar" onClick={() => setMenuAberto('NENHUM')} aria-label="Fechar janela">X</button>
                
                {menuAberto === 'ATIVIDADES' && (
                  <><h2>Trabalhos</h2>
                  {Object.entries(ACOES_TRABALHO).map(([id, acao]) => (
                    <button key={id} className="btn btn-verde" onClick={() => trabalhar(id)} disabled={acaoAtual !== 'LIVRE'}>
                      {acao.icone} {acao.nome} ({formatarTempo(acao.tempo)}) | +{acao.recompensa}💰
                    </button>
                  ))}
                  <button className="btn btn-azul mt-2" onClick={darBanho} disabled={acaoAtual !== 'LIVRE'}>🧽 Banho (30s)</button></>
                )}

                {menuAberto === 'COMIDA' && (
                  <><h2>Alimentar</h2>
                  {Object.keys(RACOES).map(tipo => (
                    <button key={tipo} className="btn btn-laranja" onClick={() => alimentar(tipo)} disabled={inventarioRacoes[tipo] <= 0}>
                      Dar {RACOES[tipo].icone} (Tem: {inventarioRacoes[tipo]})
                    </button>
                  ))}</>
                )}

                {menuAberto === 'LOJA' && (
                  <><h2>Pet Shop</h2>
                  <div className="grid-botoes">
                    {Object.keys(RACOES).map(t => <button key={t} className="btn btn-roxo" onClick={() => comprarRacao(t)}>{RACOES[t].icone} ${RACOES[t].preco}</button>)}
                  </div>
                  <hr className="divisoria" />
                  {CASINHAS[nivelCasinha + 1] ? (
                    <button className={`btn mt-2 ${dogcoins >= CASINHAS[nivelCasinha + 1].preco ? 'btn-amarelo' : 'btn-cinza'}`} onClick={evoluirCasinha} disabled={dogcoins < CASINHAS[nivelCasinha + 1].preco}>
                      🏠 Melhorar Casa ({CASINHAS[nivelCasinha + 1].preco}💰)
                    </button>
                  ) : (<button className="btn btn-verde mt-2" disabled>🏰 Mansão Máxima!</button>)}</>
                )}

                {menuAberto === 'INVENTARIO' && (
                  <><h2>Mochila</h2>
                  <p>🍪 Biscoitos: <strong>{inventarioRacoes.biscoito}</strong></p>
                  <p>🍖 Ração: <strong>{inventarioRacoes.comum}</strong></p>
                  <p>🥩 Patê: <strong>{inventarioRacoes.premium}</strong></p></>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <button onClick={resetarJogo} className="btn-reset mt-3" aria-label="Zerar todo o progresso do jogo">Zerar Jogo</button>
    </div>
  )
}

export default App