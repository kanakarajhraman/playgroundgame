const app = {
    currentComp: null,
    isPlaying: false,
    score: 0,
    completed: new Set(),
    animationFrame: null,
    simTime: 0,

    // Data for playground components
    components: {
        swing: {
            title: "Swing",
            explanation: "As the swing moves up, its speed decreases and its height increases. Kinetic Energy is converted to Gravitational Potential Energy. At the highest point, GPE is maximum and KE is zero.",
            sliderLabel: "Push Height",
            questions: [
                {
                    q: "At which point is the Gravitational Potential Energy (GPE) highest?",
                    a: ["At the lowest point", "At the highest point of the swing", "In the middle of the swing"],
                    correct: 1,
                    feedback: "GPE depends on height. The higher the object, the more GPE it has!"
                },
                {
                    q: "What happens to energy as the swing moves downwards?",
                    a: ["GPE is converted to KE", "KE is converted to GPE", "Energy is destroyed"],
                    correct: 0,
                    feedback: "As it moves down, it loses height (less GPE) but gains speed (more KE)."
                }
            ]
        },
        seesaw: {
            title: "See-saw",
            explanation: "When one side goes up, it gains GPE. When it drops, GPE is converted to KE to move the other person up. Some energy is converted to sound when the see-saw hits the ground.",
            sliderLabel: "Kid's Weight",
            questions: [
                {
                    q: "Why does the see-saw make a 'thud' sound when it hits the ground?",
                    a: ["Energy is used up", "Some KE is converted to sound energy", "The see-saw lost all its energy"],
                    correct: 1,
                    feedback: "Energy is never lost, only converted. The collision creates sound and heat."
                }
            ]
        },
        slide: {
            title: "Slide",
            explanation: "At the top of the slide, you have maximum GPE. As you slide down, GPE converts to KE. Friction between your clothes and the slide also converts some energy into Heat.",
            sliderLabel: "Slide Height",
            questions: [
                {
                    q: "If the slide is made steeper, what happens at the bottom?",
                    a: ["Less KE", "More KE (faster speed)", "GPE remains the same"],
                    correct: 1,
                    feedback: "A higher starting point means more GPE, which converts into more KE!"
                }
            ]
        },
        roundabout: {
            title: "Merry-Go-Round",
            explanation: "Your chemical potential energy (from food) is converted into kinetic energy when you push the roundabout. Friction eventually converts this KE into heat, causing it to slow down.",
            sliderLabel: "Push Strength",
            questions: [
                {
                    q: "Where did the energy to move the roundabout come from initially?",
                    a: ["Gravity", "Chemical Potential Energy from the person", "Elastic Potential Energy"],
                    correct: 1,
                    feedback: "Humans use chemical potential energy stored in their bodies to move muscles."
                }
            ]
        },
        climber: {
            title: "Climbing Frame",
            explanation: "Climbing involves converting Chemical Potential Energy from your body into Gravitational Potential Energy as you move higher up the frame.",
            sliderLabel: "Climbing Speed",
            questions: [
                {
                    q: "A boy sits still at the very top of the frame. What energy does he have?",
                    a: ["Only KE", "Only GPE", "Both KE and GPE"],
                    correct: 1,
                    feedback: "Since he is at a height but not moving, he has GPE but no KE."
                }
            ]
        }
    },

    init() {
        // Event Listeners
        document.getElementById('homeBtn').onclick = () => this.showView('view-map');
        document.getElementById('playPauseBtn').onclick = () => this.togglePlay();
        document.getElementById('resetBtn').onclick = () => this.resetSim();
        
        // Load progress
        const savedScore = localStorage.getItem('playground_score');
        if(savedScore) {
            this.score = parseInt(savedScore);
            this.updateStats();
        }

        this.showView('view-map');
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        if(viewId === 'view-map') {
            this.stopSim();
        }
    },

    loadComponent(compId) {
        this.currentComp = compId;
        const data = this.components[compId];
        
        document.getElementById('comp-title').innerText = data.title;
        document.getElementById('comp-explanation').innerText = data.explanation;
        document.getElementById('slider-label').innerText = data.sliderLabel;
        
        this.renderQuiz(data.questions);
        this.resetSim();
        this.showView('view-component');
        this.renderSVG();

        // Update Nav
        const keys = Object.keys(this.components);
        const idx = keys.indexOf(compId);
        document.getElementById('prevCompBtn').onclick = () => this.loadComponent(keys[(idx - 1 + keys.length) % keys.length]);
        document.getElementById('nextCompBtn').onclick = () => this.loadComponent(keys[(idx + 1) % keys.length]);
    },

    renderSVG() {
        const stage = document.getElementById('animation-stage');
        let svgHtml = '';
        
        if(this.currentComp === 'swing') {
            svgHtml = `
                <svg viewBox="0 0 200 200" width="200" height="200">
                    <line x1="50" y1="20" x2="150" y2="20" stroke="#5d4037" stroke-width="5"/>
                    <line x1="100" y1="20" x2="100" y2="120" stroke="#333" stroke-width="2" id="swing-rope" />
                    <rect id="swing-seat" x="80" y="120" width="40" height="10" fill="#2196F3" />
                </svg>`;
        } else if(this.currentComp === 'slide') {
            svgHtml = `
                <svg viewBox="0 0 200 200" width="200" height="200">
                    <path d="M40 160 L40 60 L160 160" fill="none" stroke="#5d4037" stroke-width="5"/>
                    <circle id="player-ball" cx="40" cy="60" r="10" fill="#FF9800" />
                </svg>`;
        } else {
            svgHtml = `<p style="padding: 20px">Interactive visual for ${this.currentComp} loading...</p>`;
        }
        
        stage.innerHTML = svgHtml;
    },

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('playPauseBtn').innerText = this.isPlaying ? "Pause" : "Start";
        if(this.isPlaying) this.animate();
    },

    resetSim() {
        this.stopSim();
        this.simTime = 0;
        this.updateMeters(0, 0, 0);
        this.renderSVG();
    },

    stopSim() {
        this.isPlaying = false;
        document.getElementById('playPauseBtn').innerText = "Start";
        cancelAnimationFrame(this.animationFrame);
    },

    animate() {
        if(!this.isPlaying) return;

        const val = document.getElementById('sim-slider').value;
        this.simTime += 0.05;

        if(this.currentComp === 'swing') {
            const angle = (val/100) * Math.cos(this.simTime * 2);
            const rope = document.getElementById('swing-rope');
            const seat = document.getElementById('swing-seat');
            
            const x2 = 100 + 100 * Math.sin(angle);
            const y2 = 20 + 100 * Math.cos(angle);
            
            if(rope) {
                rope.setAttribute('x2', x2);
                rope.setAttribute('y2', y2);
            }
            if(seat) {
                seat.setAttribute('x', x2 - 20);
                seat.setAttribute('y', y2);
            }

            // Energy Math
            const heightFactor = Math.cos(angle); 
            const gpe = heightFactor * 100;
            const ke = (1 - heightFactor) * 100;
            this.updateMeters(gpe, ke, 5);
        }

        if(this.currentComp === 'slide') {
            const ball = document.getElementById('player-ball');
            let progress = (this.simTime % 2) / 2; // 0 to 1
            let x = 40 + (120 * progress);
            let y = 60 + (100 * progress);
            
            ball.setAttribute('cx', x);
            ball.setAttribute('cy', y);

            const gpe = (1 - progress) * 100;
            const ke = progress * 80;
            const heat = progress * 20;
            this.updateMeters(gpe, ke, heat);
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    updateMeters(gpe, ke, loss) {
        document.getElementById('bar-gpe').style.width = gpe + '%';
        document.getElementById('bar-ke').style.width = ke + '%';
        document.getElementById('bar-loss').style.width = loss + '%';
    },

    renderQuiz(questions) {
        const container = document.getElementById('quiz-container');
        container.innerHTML = '';

        questions.forEach((q, qIdx) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'quiz-q';
            qDiv.innerHTML = `<p><strong>Q${qIdx+1}: ${q.q}</strong></p>`;
            
            const optDiv = document.createElement('div');
            optDiv.className = 'options';
            
            q.a.forEach((opt, oIdx) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = opt;
                btn.onclick = () => this.checkAnswer(btn, qIdx, oIdx, q.correct, q.feedback);
                optDiv.appendChild(btn);
            });
            
            qDiv.appendChild(optDiv);
            container.appendChild(qDiv);
        });
    },

    checkAnswer(btn, qIdx, chosenIdx, correctIdx, feedback) {
        const parent = btn.parentElement;
        if(parent.classList.contains('answered')) return;

        parent.classList.add('answered');
        if(chosenIdx === correctIdx) {
            btn.classList.add('correct');
            this.score += 10;
            this.completed.add(this.currentComp);
        } else {
            btn.classList.add('wrong');
            parent.children[correctIdx].classList.add('correct');
        }

        const fb = document.createElement('p');
        fb.style.marginTop = "10px";
        fb.innerHTML = `<em>${feedback}</em>`;
        parent.parentElement.appendChild(fb);

        this.updateStats();
        localStorage.setItem('playground_score', this.score);
    },

    updateStats() {
        document.getElementById('progressText').innerText = `Completed: ${this.completed.size}/5`;
        document.getElementById('totalScore').innerText = `Score: ${this.score}`;
    }
};

window.onload = () => app.init();