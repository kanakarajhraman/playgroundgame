const app = {
    state: {
        score: 0,
        completed: new Set(),
        currentId: null,
        isPlaying: false,
        time: 0,
        animFrame: null
    },

    config: {
        swing: {
            name: "Swing",
            desc: "As the swing moves up, Kinetic Energy (KE) is converted to Gravitational Potential Energy (GPE). At the top, GPE is highest!",
            slider: "Starting Height",
            questions: [
                { q: "At the highest point, what energy is maximum?", a: ["Kinetic", "GPE", "Sound"], c: 1 }
            ]
        },
        slide: {
            name: "Slide",
            desc: "Gravity pulls you down! GPE at the top converts to KE as you speed up, and Heat due to friction.",
            slider: "Slide Steepness",
            questions: [
                { q: "Why do you feel warm after sliding?", a: ["Energy is created", "Friction converts KE to Heat", "Sunlight"], c: 1 }
            ]
        },
        seesaw: {
            name: "See-Saw",
            desc: "Energy is transferred between two people. When one side goes up, it gains GPE.",
            slider: "Weight of Child",
            questions: [
                { q: "When you are high in the air, you have more...", a: ["GPE", "KE", "Chemical Energy"], c: 0 }
            ]
        },
        roundabout: {
            name: "Roundabout",
            desc: "You use Chemical Potential Energy from your food to push! This becomes Kinetic Energy.",
            slider: "Push Force",
            questions: [
                { q: "Pushing the roundabout uses what energy?", a: ["Electrical", "Chemical Potential", "Elastic"], c: 1 }
            ]
        },
        climber: {
            name: "Climbing Frame",
            desc: "Climbing up converts Chemical Potential Energy from your muscles into GPE.",
            slider: "Climb Speed",
            questions: [
                { q: "Stopping at the top means you have...", a: ["No energy", "Maximum KE", "Maximum GPE"], c: 2 }
            ]
        }
    },

    init() {
        document.getElementById('homeBtn').onclick = () => this.showMap();
        document.getElementById('startBtn').onclick = () => this.toggleSim();
        document.getElementById('resetBtn').onclick = () => this.resetSim();
        this.showMap();
    },

    showMap() {
        this.stopSim();
        document.getElementById('map-view').classList.remove('hidden');
        document.getElementById('comp-view').classList.add('hidden');
        document.getElementById('sub-header').innerText = "Select a component to explore!";
    },

    nav(id) {
        this.state.currentId = id;
        const data = this.config[id];
        document.getElementById('map-view').classList.add('hidden');
        document.getElementById('comp-view').classList.remove('hidden');
        
        document.getElementById('comp-name').innerText = data.name;
        document.getElementById('comp-desc').innerText = data.desc;
        document.getElementById('slider-label').innerText = data.slider;
        document.getElementById('sub-header').innerText = "Exploring: " + data.name;

        this.renderQuiz(data.questions);
        this.resetSim();
        this.drawSimStructure();
    },

    drawSimStructure() {
        const stage = document.getElementById('sim-display');
        if(this.state.currentId === 'swing') {
            stage.innerHTML = `
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <line x1="100" y1="20" x2="100" y2="150" stroke="#333" stroke-width="3" id="rope" />
                    <rect id="seat" x="80" y="150" width="40" height="10" fill="var(--accent)" />
                </svg>`;
        } else {
            stage.innerHTML = `<div style="text-align:center">Visual simulation of ${this.state.currentId} <br> [Dynamic SVG Animation Area]</div>`;
        }
    },

    toggleSim() {
        this.state.isPlaying = !this.state.isPlaying;
        document.getElementById('startBtn').innerText = this.state.isPlaying ? "Pause" : "Start";
        if(this.state.isPlaying) this.loop();
    },

    stopSim() {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.animFrame);
    },

    resetSim() {
        this.stopSim();
        this.state.time = 0;
        document.getElementById('startBtn').innerText = "Start";
        this.updateMeters(0,0,0);
        this.drawSimStructure();
    },

    loop() {
        if(!this.state.isPlaying) return;
        this.state.time += 0.05;
        const val = document.getElementById('sim-slider').value;

        if(this.state.currentId === 'swing') {
            const angle = (val/100) * Math.sin(this.state.time * 2);
            const x = 100 + 100 * Math.sin(angle);
            const y = 20 + 100 * Math.cos(angle);
            
            const rope = document.getElementById('rope');
            const seat = document.getElementById('seat');
            if(rope) { rope.setAttribute('x2', x); rope.setAttribute('y2', y); }
            if(seat) { seat.setAttribute('x', x-20); seat.setAttribute('y', y); }

            // Math for meters
            const gpe = Math.abs(angle * 100);
            const ke = 100 - gpe;
            this.updateMeters(gpe, ke, 5);
        }

        this.state.animFrame = requestAnimationFrame(() => this.loop());
    },

    updateMeters(gpe, ke, loss) {
        document.getElementById('m-gpe').style.width = gpe + "%";
        document.getElementById('m-ke').style.width = ke + "%";
        document.getElementById('m-loss').style.width = loss + "%";
    },

    renderQuiz(qs) {
        const area = document.getElementById('quiz-area');
        area.innerHTML = "";
        qs.forEach((q, i) => {
            const div = document.createElement('div');
            div.innerHTML = `<p><strong>${q.q}</strong></p>`;
            q.a.forEach((opt, oi) => {
                const btn = document.createElement('button');
                btn.className = "quiz-opt";
                btn.innerText = opt;
                btn.onclick = () => {
                    if(oi === q.c) {
                        btn.classList.add('correct');
                        this.state.score += 10;
                        this.state.completed.add(this.state.currentId);
                        this.updateUI();
                    } else {
                        btn.classList.add('wrong');
                    }
                };
                div.appendChild(btn);
            });
            area.appendChild(div);
        });
    },

    updateUI() {
        document.getElementById('score-val').innerText = this.state.score;
        const prog = (this.state.completed.size / 5) * 100;
        document.getElementById('progress-bar').style.width = prog + "%";
    },

    nextComp() {
        const keys = Object.keys(this.config);
        let idx = keys.indexOf(this.state.currentId);
        this.nav(keys[(idx + 1) % keys.length]);
    },

    prevComp() {
        const keys = Object.keys(this.config);
        let idx = keys.indexOf(this.state.currentId);
        this.nav(keys[(idx - 1 + keys.length) % keys.length]);
    }
};

window.onload = () => app.init();