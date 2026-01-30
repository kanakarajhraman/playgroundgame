const app = {
    currentId: null,
    score: 0,
    completed: new Set(),

    data: {
        swing: {
            title: "Swing",
            explanation: "As the swing moves to its highest points (Start and End), it has the most GPE. As it passes the middle (bottom), it moves the fastest and has the most KE.",
            questions: [
                { q: "Where is the Kinetic Energy highest?", a: ["At the highest points", "At the lowest point (middle)", "When it is not moving"], c: 1 },
                { q: "What happens to GPE as the swing moves from the side to the middle?", a: ["Increases", "Decreases", "Stays the same"], c: 1 }
            ]
        },
        slide: {
            title: "Slide",
            explanation: "At the top, you have maximum GPE. As you slide down, GPE is converted into KE (speed) and some heat energy due to friction.",
            questions: [
                { q: "Why do you have more GPE at the top of the slide?", a: ["Because you are moving fast", "Because you are at a higher position", "Because the slide is smooth"], c: 1 }
            ]
        },
        seesaw: {
            title: "See-Saw",
            explanation: "When you push off the ground, your Chemical Potential Energy converts to KE to lift you, which then becomes GPE as you reach the top.",
            questions: [
                { q: "When the see-saw hits the ground, what energy is produced?", a: ["Sound Energy", "Chemical Energy", "Solar Energy"], c: 0 }
            ]
        },
        roundabout: {
            title: "Roundabout",
            explanation: "Pushing the roundabout converts Chemical Potential Energy from your muscles into Kinetic Energy.",
            questions: [
                { q: "What happens if you stop pushing?", a: ["It spins forever", "KE is slowly converted to Heat by friction until it stops", "Energy disappears"], c: 1 }
            ]
        },
        climber: {
            title: "Climbing Frame",
            explanation: "The higher you climb, the more GPE you store. If you stay still at the top, you have GPE but no KE.",
            questions: [
                { q: "A girl hangs still on the highest bar. Does she have KE?", a: ["Yes", "No"], c: 1 }
            ]
        }
    },

    init() {
        document.getElementById('sim-slider').addEventListener('input', (e) => this.updateSim(e.target.value));
        document.getElementById('homeBtn').onclick = () => this.showMap();
        this.showMap();
    },

    showMap() {
        document.getElementById('view-map').classList.remove('hidden');
        document.getElementById('view-component').classList.add('hidden');
    },

    loadComponent(id) {
        this.currentId = id;
        const comp = this.data[id];
        
        document.getElementById('comp-title').innerText = comp.title;
        document.getElementById('comp-explanation').innerText = comp.explanation;
        document.getElementById('view-map').classList.add('hidden');
        document.getElementById('view-component').classList.remove('hidden');
        
        // Reset slider and sim
        document.getElementById('sim-slider').value = 0;
        this.renderSVG(id);
        this.updateSim(0);
        this.renderQuiz(comp.questions);
    },

    renderSVG(id) {
        const container = document.getElementById('svg-container');
        if (id === 'swing') {
            container.innerHTML = `
                <svg width="200" height="250" viewBox="0 0 200 250">
                    <line x1="100" y1="20" x2="100" y2="200" stroke="#555" stroke-width="4" id="swing-rope" />
                    <rect id="swing-seat" x="70" y="200" width="60" height="15" rx="5" fill="#d32f2f" />
                    <line x1="50" y1="20" x2="150" y2="20" stroke="#333" stroke-width="8" />
                </svg>`;
        } else if (id === 'slide') {
            container.innerHTML = `
                <svg width="250" height="250" viewBox="0 0 250 250">
                    <path d="M50 50 L50 220 M50 50 L200 220" stroke="#555" stroke-width="6" fill="none" />
                    <circle id="slider-kid" cx="50" cy="50" r="15" fill="#ff9800" />
                </svg>`;
        } else if (id === 'seesaw') {
            container.innerHTML = `
                <svg width="250" height="250" viewBox="0 0 250 250">
                    <path d="M125 180 L100 220 L150 220 Z" fill="#777" />
                    <g id="seesaw-plank">
                        <rect x="25" y="175" width="200" height="10" fill="#795548" />
                        <circle cx="45" cy="160" r="12" fill="#2196f3" />
                        <circle cx="205" cy="160" r="12" fill="#f44336" />
                    </g>
                </svg>`;
        } else {
            container.innerHTML = `<div style="font-size:3rem">🎡</div><p>Animation coming soon!</p>`;
        }
    },

    updateSim(value) {
        const pct = value / 100;
        let gpe = 0;
        let ke = 0;

        if (this.currentId === 'swing') {
            // Swing uses a sine wave for the 1-cycle movement
            const angle = Math.cos(pct * Math.PI * 2) * 45; // Swing -45 to 45 deg
            const rope = document.getElementById('swing-rope');
            const seat = document.getElementById('swing-seat');
            
            const x2 = 100 + 180 * Math.sin(angle * Math.PI / 180);
            const y2 = 20 + 180 * Math.cos(angle * Math.PI / 180);
            
            rope.setAttribute('x2', x2);
            rope.setAttribute('y2', y2);
            seat.setAttribute('x', x2 - 30);
            seat.setAttribute('y', y2);

            // GPE is high at the ends (angle is max)
            gpe = Math.abs(Math.sin(angle * Math.PI / 180)) * 100;
            ke = 100 - gpe;
        } 
        
        else if (this.currentId === 'slide') {
            const kid = document.getElementById('slider-kid');
            const startX = 50, startY = 50;
            const endX = 200, endY = 220;
            
            const currX = startX + (endX - startX) * pct;
            const currY = startY + (endY - startY) * pct;
            
            kid.setAttribute('cx', currX);
            kid.setAttribute('cy', currY);

            gpe = (1 - pct) * 100;
            ke = pct * 90; // Loss due to friction
        }

        else if (this.currentId === 'seesaw') {
            const plank = document.getElementById('seesaw-plank');
            const angle = Math.sin(pct * Math.PI * 2) * 20;
            plank.setAttribute('transform', `rotate(${angle}, 125, 180)`);
            
            gpe = Math.abs(Math.sin(angle * Math.PI / 180)) * 100;
            ke = 100 - gpe;
        }

        // Update Graph Bars
        document.getElementById('graph-gpe').style.height = gpe + "%";
        document.getElementById('graph-ke').style.height = ke + "%";
    },

    renderQuiz(questions) {
        const container = document.getElementById('quiz-container');
        container.innerHTML = "";
        
        questions.forEach((q, qIdx) => {
            const qDiv = document.createElement('div');
            qDiv.innerHTML = `<p style="margin-top:20px"><strong>Q: ${q.q}</strong></p>`;
            
            q.a.forEach((opt, oIdx) => {
                const btn = document.createElement('button');
                btn.className = "quiz-opt";
                btn.innerText = opt;
                btn.onclick = () => {
                    if (oIdx === q.c) {
                        btn.classList.add('correct');
                        if (!this.completed.has(this.currentId + qIdx)) {
                            this.score += 10;
                            this.completed.add(this.currentId + qIdx);
                            this.updateStats();
                        }
                    } else {
                        btn.classList.add('wrong');
                    }
                };
                qDiv.appendChild(btn);
            });
            container.appendChild(qDiv);
        });
    },

    updateStats() {
        document.getElementById('totalScore').innerText = this.score;
        // Approximation of progress
        const uniqueComps = new Set([...this.completed].map(id => id.replace(/[0-9]/g, '')));
        document.getElementById('progressText').innerText = `${uniqueComps.size}/5`;
    }
};

window.onload = () => app.init();