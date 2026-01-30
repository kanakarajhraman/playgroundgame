const app = {
    score: 0,
    completedItems: new Set(),
    currentId: null,

    data: {
        swing: {
            title: "Swing Simulation",
            explanation: "At the highest point, the swing stops for a split second, so Kinetic Energy is 0 and GPE is at its maximum. As it moves down, GPE is converted to Kinetic Energy. Speed is highest at the bottom!",
            questions: [
                {
                    q: "At which point is the speed of the swing the highest?",
                    options: ["At the highest point", "At the lowest point (bottom)", "Halfway up"],
                    correct: 1,
                    feedback: "Correct! Speed is highest at the bottom where GPE is lowest."
                },
                {
                    q: "What energy conversion takes place as the swing moves upwards?",
                    options: ["KE to GPE", "GPE to KE", "Chemical to Heat"],
                    correct: 0,
                    feedback: "Yes! Moving higher means gaining height (GPE) by losing speed (KE)."
                }
            ]
        },
        seesaw: { title: "See-saw", explanation: "Pushing off the ground converts Chemical Potential Energy into Kinetic Energy...", questions: [] },
        slide: { title: "Slide", explanation: "At the top, you have maximum GPE. Friction converts some energy to Heat...", questions: [] },
        roundabout: { title: "Merry-go-round", explanation: "Kinetic energy keeps it spinning until friction slows it down...", questions: [] },
        climber: { title: "Climbing Frame", explanation: "The higher you climb, the more GPE you have stored...", questions: [] }
    },

    init() {
        document.getElementById('homeBtn').onclick = () => this.showView('view-map');
        document.getElementById('sim-slider').oninput = (e) => this.updateSwing(e.target.value);
        document.getElementById('resetSimBtn').onclick = () => {
            document.getElementById('sim-slider').value = 0;
            this.updateSwing(0);
        };
        this.showView('view-map');
        
        // Load highscore
        this.score = parseInt(localStorage.getItem('p5_playground_score')) || 0;
        this.updateStats();
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    },

    loadComponent(id) {
        this.currentId = id;
        const info = this.data[id];
        document.getElementById('comp-title').innerText = info.title;
        document.getElementById('comp-explanation').innerText = info.explanation;
        
        // Toggle SVGs
        document.getElementById('svg-swing').classList.add('hidden');
        document.getElementById('other-placeholder').classList.add('hidden');

        if (id === 'swing') {
            document.getElementById('svg-swing').classList.remove('hidden');
            this.updateSwing(0);
        } else {
            document.getElementById('other-placeholder').classList.remove('hidden');
            this.updateMeters(0,0,0);
        }

        this.renderQuiz(info.questions);
        this.showView('view-component');
    },

    updateSwing(value) {
        // Map 0-100 slider to a full swing arc cycle
        // Formula: Angle = 45 * cos(val * 2 * PI / 100)
        const phase = (value / 100) * Math.PI; // 0 to PI
        const angleDegrees = 45 * Math.cos(phase);
        const angleRad = (angleDegrees * Math.PI) / 180;

        const pivotX = 200;
        const pivotY = 50;
        const length = 200;

        const newX = pivotX + length * Math.sin(angleRad);
        const newY = pivotY + length * Math.cos(angleRad);

        // Update SVG Elements
        const rope = document.getElementById('swing-rope-1');
        const seat = document.getElementById('swing-seat');

        rope.setAttribute('x2', newX);
        rope.setAttribute('y2', newY);
        seat.setAttribute('x', newX - 30);
        seat.setAttribute('y', newY);

        // Calculate Energy
        // GPE is based on Height (Y)
        // KE is based on Speed (approximated by how far from center)
        let gpe = (Math.abs(angleDegrees) / 45) * 100;
        let ke = 100 - gpe;
        
        this.updateMeters(ke, gpe, 2); // 2% constant thermal loss for visual effect
    },

    updateMeters(ke, gpe, thermal) {
        document.getElementById('bar-ke').style.height = ke + "%";
        document.getElementById('bar-gpe').style.height = gpe + "%";
        document.getElementById('bar-thermal').style.height = thermal + "%";
    },

    renderQuiz(questions) {
        const container = document.getElementById('quiz-container');
        container.innerHTML = "";
        
        questions.forEach((q, idx) => {
            const div = document.createElement('div');
            div.className = "quiz-item";
            div.innerHTML = `<p><strong>Q${idx+1}: ${q.q}</strong></p>`;
            
            q.options.forEach((opt, oIdx) => {
                const btn = document.createElement('button');
                btn.className = "quiz-option";
                btn.innerText = opt;
                btn.onclick = () => this.handleAnswer(btn, idx, oIdx, q.correct, q.feedback);
                div.appendChild(btn);
            });
            container.appendChild(div);
        });
    },

    handleAnswer(btn, qIdx, selected, correct, feedback) {
        if (btn.parentElement.classList.contains('locked')) return;

        if (selected === correct) {
            btn.classList.add('correct');
            this.score += 10;
            this.completedItems.add(this.currentId);
        } else {
            btn.classList.add('wrong');
        }
        
        btn.parentElement.classList.add('locked');
        const msg = document.createElement('p');
        msg.innerHTML = `<small>${feedback}</small>`;
        btn.parentElement.appendChild(msg);

        this.updateStats();
        localStorage.setItem('p5_playground_score', this.score);
    },

    updateStats() {
        document.getElementById('totalScore').innerText = this.score;
        document.getElementById('progressText').innerText = `${this.completedItems.size}/5`;
    }
};

window.onload = () => app.init();