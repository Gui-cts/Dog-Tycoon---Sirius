import { useState, useEffect } from 'react'
import './App.css'
import videoDog from './dog.gif'
import imgDogDormindo from './husky_dormindo.png'; 
import imgDogBanho from './dog-banho.png';
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

const BRINQUEDOS = {
  graveto: { nome: 'Graveto', preco: 30, multiplicador: 2, durabilidade: 5, icone: '🪵' },
  bolinha: { nome: 'Bolinha', preco: 100, multiplicador: 3, durabilidade: 10, icone: '🎾' },
  frisbee: { nome: 'Frisbee', preco: 400, multiplicador: 5, durabilidade: 15, icone: '🥏' }
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
  const [inventarioBrinquedos, setInventarioBrinquedos] = useState(saveAntigo?.inventarioBrinquedos ?? { graveto: 0, bolinha: 0, frisbee: 0 })
  const [brinquedoEquipado, setBrinquedoEquipado] = useState(saveAntigo?.brinquedoEquipado ?? null) 
  const [nivelCasinha, setNivelCasinha] = useState(saveAntigo?.nivelCasinha ?? 1)
  const [menuAberto, setMenuAberto] = useState('NENHUM');

  useEffect(() => {
    if (saveAntigo && saveAntigo.acaoAtual === 'DORMINDO') {
      const agora = Date.now();
      const msOffline = agora - saveAntigo.ultimoTickGeral;
      const segOffline = msOffline / 1000;
      const recuperacaoTotal = CASINHAS[saveAntigo.nivelCasinha].recPorSeg * segOffline;
      
      setEnergia(prev => {
        const novaEnergia = Math.min(100, prev + recuperacaoTotal);
        if (novaEnergia >= 100) setAcaoAtual('LIVRE');
        return novaEnergia;
      });
    }
  }, []);

  useEffect(() => {
    if (bloqueiaSave) return;
    localStorage.setItem('dogTycoonSave', JSON.stringify({
      dogcoins, energia, fome, felicidade, sujeira, acaoAtual,
      tempoFimAcao, recompensaPendente, ultimoDrain, ultimoTickGeral, 
      inventarioRacoes, inventarioBrinquedos, brinquedoEquipado, nivelCasinha
    }));
  }, [dogcoins, energia, fome, felicidade, sujeira, acaoAtual, tempoFimAcao, recompensaPendente, ultimoDrain, ultimoTickGeral, inventarioRacoes, inventarioBrinquedos, brinquedoEquipado, nivelCasinha]);

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
        if (ACOES_TRABALHO[acaoAtual]) {
            setDogcoins(prev => prev + (Number(recompensaPendente) || 0));
        }
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
    setEnergia(prev => Math.max(0, prev - energiaCusto));
    setFome(prev => Math.min(100, prev + fomeCusto)); 
    setSujeira(prev => Math.min(100, prev + sujeiraCusto));
    setRecompensaPendente(recompensa || 0);
    setTempoFimAcao(Date.now() + tempoMs); 
    setAcaoAtual(tipo);
    setMenuAberto('NENHUM');
  };

  const calcularRecompensaReal = (recompensaBase) => {
    let ganho = Number(recompensaBase) || 0;
    
    // SISTEMA DE BUFFS E DEBUFFS APLICADOS AQUI:
    if (felicidade >= 80) ganho = Math.ceil(ganho * 1.2);   // +20% se feliz
    if (sujeira >= 75) ganho = Math.floor(ganho / 2);       // -50% se sujo
    if (fome >= 80) ganho = Math.floor(ganho * 0.8);        // -20% se faminto
    
    if (brinquedoEquipado && brinquedoEquipado.multiplicador) {
      ganho = Math.ceil(ganho * Number(brinquedoEquipado.multiplicador));
    }
    return ganho;
  };

  const trabalhar = (id) => {
    if (acaoAtual !== 'LIVRE') return;
    const a = ACOES_TRABALHO[id];
    if (energia < a.energia) return alert("Energia insuficiente!");
    if (fome >= 100) return alert("Sirius está com muita fome e se recusa a trabalhar!");

    const ganhoFinal = calcularRecompensaReal(a.recompensa);

    if (brinquedoEquipado) {
      setBrinquedoEquipado(prev => {
        const novosUsos = prev.usosRestantes - 1;
        if (novosUsos <= 0) return null; 
        return { ...prev, usosRestantes: novosUsos };
      });
    }

    iniciarAcao(id, a.tempo * 1000, ganhoFinal, a.energia, a.fome, a.sujeira);
  };

  const equiparBrinquedo = (tipo) => {
    if (brinquedoEquipado) return alert("Sirius já está com um brinquedo! Espere quebrar para dar outro.");
    if (inventarioBrinquedos[tipo] <= 0) return;
    
    const b = BRINQUEDOS[tipo];
    setInventarioBrinquedos(prev => ({ ...prev, [tipo]: prev[tipo] - 1 }));
    setBrinquedoEquipado({ 
      nome: b.nome, 
      multiplicador: b.multiplicador, 
      usosRestantes: b.durabilidade, 
      icone: b.icone 
    });
    setMenuAberto('NENHUM');
  };

  const comprarItem = (tipo, categoria) => {
    const item = categoria === 'RACAO' ? RACOES[tipo] : BRINQUEDOS[tipo];
    if (dogcoins >= item.preco) {
      setDogcoins(prev => prev - item.preco);
      if (categoria === 'RACAO') {
        setInventarioRacoes(prev => ({ ...prev, [tipo]: prev[tipo] + 1 }));
      } else {
        setInventarioBrinquedos(prev => ({ ...prev, [tipo]: prev[tipo] + 1 }));
      }
    } else {
      alert("Dogcoins insuficientes!");
    }
  };

  const alternarSono = () => setAcaoAtual(acaoAtual === 'DORMINDO' ? 'LIVRE' : 'DORMINDO');
  const darBanho = () => {
    if (acaoAtual !== 'LIVRE') return;
    iniciarAcao('BANHO', 30000);
  }
  
  const alimentar = (tipo) => {
    if (acaoAtual !== 'LIVRE' || inventarioRacoes[tipo] <= 0) return;
    const item = RACOES[tipo];
    setInventarioRacoes(prev => ({ ...prev, [tipo]: prev[tipo] - 1 }));
    setFome(prev => Math.max(0, prev - item.saciedade));
    setFelicidade(prev => Math.min(100, prev + item.felicidade));
    iniciarAcao('COMENDO', 10000);
  };

  const evoluirCasinha = () => {
    const prox = nivelCasinha + 1;
    if (CASINHAS[prox] && dogcoins >= CASINHAS[prox].preco) {
      setDogcoins(prev => prev - CASINHAS[prox].preco);
      setNivelCasinha(prox);
    }
  };

  const lidarComTecla = (e, acao) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acao(); } };

  return (
    <div className="jogo-container">
      <div className="header-jogo"><h1>Dog Tycoon 🐾</h1></div>
      <div className="layout-principal">
        <div className="coluna-status">
          <h2>Status</h2>
          <div className="status-item"><div className="status-label">⚡ Energia <span>{Math.floor(energia)}%</span></div><progress className="prog-energia" value={energia} max="100"></progress></div>
          <div className="status-item"><div className="status-label">🍖 Fome <span>{fome}%</span></div><progress className="prog-fome" value={fome} max="100"></progress></div>
          <div className="status-item"><div className="status-label">❤️ Feliz <span>{felicidade}%</span></div><progress className="prog-felicidade" value={felicidade} max="100"></progress></div>
          <div className="status-item"><div className="status-label">🧽 Sujeira <span>{sujeira}%</span></div><progress className="prog-sujeira" value={sujeira} max="100"></progress></div>
          
          {/* EFEITOS ATIVOS (UI Nova para mostrar Buffs/Debuffs) */}
          <div className="status-item mt-3">
            <div className="status-label" style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
              ✨ Efeitos Ativos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#1a2642', border: '1px solid #2a3a5a', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
              {felicidade >= 80 && <span style={{ color: '#4caf50', fontSize: '0.85rem' }}>🟢 Feliz (+20% 💰)</span>}
              {sujeira >= 75 && <span style={{ color: '#f44336', fontSize: '0.85rem' }}>🔴 Sujo (-50% 💰)</span>}
              {fome >= 80 && <span style={{ color: '#f44336', fontSize: '0.85rem' }}>🔴 Faminto (-20% 💰)</span>}
              {felicidade < 80 && sujeira < 75 && fome < 80 && <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Nenhum no momento</span>}
            </div>
          </div>

          <div className="status-item mt-3">
            <div className="status-label" style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
              🧸 Brinquedo Equipado
            </div>
            <div style={{ backgroundColor: '#1a2642', border: '1px solid #2a3a5a', padding: '10px', borderRadius: '8px', textAlign: 'center', marginTop: '5px' }}>
              {brinquedoEquipado ? (
                <>
                  <span style={{ fontSize: '1.5rem' }}>{brinquedoEquipado.icone}</span>
                  <div style={{ fontSize: '0.85rem', color: '#00d2ff', fontWeight: 'bold' }}>{brinquedoEquipado.multiplicador}x Dogcoins</div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Restam {brinquedoEquipado.usosRestantes} usos</div>
                </>
              ) : (
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Nenhum</span>
              )}
            </div>
          </div>
        </div>

        <div className="sala-container">
          <div className="painel-moedas">💰 {dogcoins}</div>
          
          {tempoFimAcao && !['LIVRE', 'DORMINDO'].includes(acaoAtual) && (
            <div className="contador-central">
              <h2>{ACOES_TRABALHO[acaoAtual]?.nome || acaoAtual}</h2>
              <div className="timer-display">{Math.max(0, Math.ceil((tempoFimAcao - Date.now()) / 1000))}s</div>
            </div>
          )}

          {acaoAtual === 'DORMINDO' && <div className="balao-sono">Zzz... {CASINHAS[nivelCasinha].textoLabel}</div>}

          {/* O CACHORRO AGORA NÃO SOME DURANTE O BANHO! */}
          {['LIVRE', 'DORMINDO', 'COMENDO', 'BANHO'].includes(acaoAtual) && (
            <div className="sprite-clicavel sprite-dog" onClick={() => setMenuAberto('ATIVIDADES')} onKeyDown={(e) => lidarComTecla(e, () => setMenuAberto('ATIVIDADES'))} role="button" tabIndex="0">
              <img src={
                acaoAtual === 'DORMINDO' ? imgDogDormindo : 
                acaoAtual === 'BANHO' ? imgDogBanho : 
                videoDog
              } alt="Sirius" style={{ width: (acaoAtual === 'DORMINDO' || acaoAtual === 'BANHO') ? '200px' : '300px' }} />
            </div>
          )}

          <div className="sprite-clicavel sprite-tigela" onClick={() => setMenuAberto('COMIDA')} role="button" tabIndex="0"><img src={acaoAtual === 'COMENDO' ? imgTigela1 : imgTigela2} alt="Tigela" style={{ width: '100px' }} /></div>
          <div className="sprite-clicavel sprite-sacola" onClick={() => setMenuAberto('LOJA')} role="button" tabIndex="0"><img src={imgSacola} alt="Loja" style={{ width: '150px' }} /></div>
          <div className="sprite-clicavel sprite-mochila" onClick={() => setMenuAberto('INVENTARIO')} role="button" tabIndex="0"><img src={imgMochila} alt="Mochila" style={{ width: '150px' }} /></div>
          
          <div className="sprite-clicavel sprite-casinha" onClick={alternarSono} role="button" tabIndex="0">
             {nivelCasinha === 1 && <img src={imgCasinha1} alt="Caixa" style={{ width: '250px' }} />}
             {nivelCasinha === 2 && <img src={imgCasinha2} alt="Caminha" style={{ width: '250px' }} />}
             {nivelCasinha === 3 && <img src={imgCasinha3} alt="Madeira" style={{ width: '250px' }} />}
             {nivelCasinha === 4 && <img src={imgCasinha4} alt="Mansão" style={{ width: '300px' }} />}
          </div>

          {menuAberto !== 'NENHUM' && (
            <div className="modal-overlay" onClick={() => setMenuAberto('NENHUM')}>
              <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
                <button className="btn-fechar" onClick={() => setMenuAberto('NENHUM')}>X</button>
                
                {menuAberto === 'ATIVIDADES' && (
                  <><h2>Trabalhos</h2>
                  {Object.entries(ACOES_TRABALHO).map(([id, acao]) => (
                    <button key={id} className="btn btn-verde" onClick={() => trabalhar(id)} disabled={acaoAtual !== 'LIVRE'}>
                      {acao.icone} {acao.nome} | +{calcularRecompensaReal(acao.recompensa)}💰
                    </button>
                  ))}
                  <button className="btn btn-azul mt-2" onClick={darBanho} disabled={acaoAtual !== 'LIVRE'}>🧽 Dar Banho (30s)</button>
                  
                  <hr className="divisoria" />
                  
                  <h2>Equipar Brinquedo</h2>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 10px 0' }}>Multiplica ganhos de trabalho.</p>
                  <div className="grid-botoes">
                    {Object.keys(BRINQUEDOS).map(t => <button key={t} className="btn btn-azul" onClick={() => equiparBrinquedo(t)} disabled={inventarioBrinquedos[t] <= 0}>{BRINQUEDOS[t].icone} ({inventarioBrinquedos[t]})</button>)}
                  </div>
                  </>
                )}

                {menuAberto === 'COMIDA' && (
                  <><h2>Alimentar</h2>
                  <div className="grid-botoes">
                    {Object.keys(RACOES).map(t => <button key={t} className="btn btn-laranja" onClick={() => alimentar(t)} disabled={inventarioRacoes[t] <= 0}>{RACOES[t].icone} ({inventarioRacoes[t]})</button>)}
                  </div></>
                )}

                {menuAberto === 'LOJA' && (
                  <><h2>Pet Shop</h2>
                  <div className="grid-botoes">
                    {Object.keys(RACOES).map(t => <button key={t} className="btn btn-roxo" onClick={() => comprarItem(t, 'RACAO')}>{RACOES[t].icone} ${RACOES[t].preco}</button>)}
                  </div>
                  <div className="grid-botoes mt-2">
                    {Object.keys(BRINQUEDOS).map(t => <button key={t} className="btn btn-azul" onClick={() => comprarItem(t, 'BRINQUEDO')}>{BRINQUEDOS[t].icone} ${BRINQUEDOS[t].preco}</button>)}
                  </div>
                  <hr className="divisoria" />
                  {CASINHAS[nivelCasinha + 1] ? (
                    <button className="btn btn-amarelo mt-2" onClick={evoluirCasinha} disabled={dogcoins < CASINHAS[nivelCasinha + 1].preco}>🏠 Melhorar Casa (${CASINHAS[nivelCasinha + 1].preco})</button>
                  ) : <button className="btn btn-verde mt-2" disabled>🏰 Mansão Máxima!</button>}</>
                )}

                {menuAberto === 'INVENTARIO' && (
                  <><h2>Mochila</h2>
                  <p>🍖 Rações: {inventarioRacoes.biscoito + inventarioRacoes.comum + inventarioRacoes.premium}</p>
                  <p>🎾 Brinquedos: {inventarioBrinquedos.graveto + inventarioBrinquedos.bolinha + inventarioBrinquedos.frisbee}</p></>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => { if(window.confirm("Zerar progresso?")) { localStorage.clear(); window.location.reload(); } }} className="btn-reset mt-3">Resetar Jogo</button>
    </div>
  )
}
export default App