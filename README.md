# 🐾 Dog Tycoon - Sirius

**Dog Tycoon** é um jogo web incremental (estilo tycoon/tamagotchi) onde o jogador gerencia a rotina de um Husky chamado Sirius. O objetivo é equilibrar as necessidades do pet enquanto ele realiza trabalhos para ganhar *Dogcoins*, permitindo comprar melhores rações, brinquedos e evoluir sua moradia de uma simples caixa de papelão até uma mansão canina.

🎮 **[Jogue agora mesmo!](https://dog-tycoon-sirius.vercel.app)**

---

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando o ecossistema moderno do desenvolvimento web:

* **[React](https://reactjs.org/):** Biblioteca principal para construção da interface e gerenciamento de estado.
* **[Vite](https://vitejs.dev/):** Ferramenta de build super rápida que substitui o Create React App.
* **JavaScript (ES6+):** Lógica do jogo, cálculos de tempo e manipulação de objetos.
* **CSS3:** Estilização responsiva, Flexbox e animações CSS (`@keyframes`).

---

## 🧠 Conceitos Aplicados (Destaques Técnicos)

Desenvolvido como um projeto de portfólio, este jogo implementa diversos conceitos cruciais da engenharia front-end:

* **Game Loop:** Utilização de `setInterval` dentro de um `useEffect` para criar um relógio interno rodando a 1 frame por segundo, processando fome, tristeza e tempo de conclusão de tarefas em tempo real.
* **Persistência de Dados:** Integração robusta com o `localStorage` do navegador (Auto-Save). O jogador pode fechar a aba e, ao voltar, seu progresso, moedas e itens continuam intactos.
* **Progressão Offline:** Lógica matemática que calcula a diferença entre o tempo atual (`Date.now()`) e o último acesso do jogador para recompensar o descanso do pet mesmo com o jogo fechado.
* **Gerenciamento de Estado Complexo:** Uso intensivo do hook `useState` para controlar múltiplas variáveis interdependentes (energia, fome, sujeira, inventário, nível da casa).
* **Componentização e Renderização Condicional:** Modais dinâmicos e sprites que mudam baseados no estado atual da aplicação (ex: o cachorro dormindo, acordado ou comendo).

---
