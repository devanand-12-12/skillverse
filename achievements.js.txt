
document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "svCompletedLessons";
    const MILESTONES = [10, 20, 30, 40];

    // Add Achievements link to navigation
    const nav = document.querySelector("nav");

    if (nav && !document.querySelector("#achievements-link")) {
        const link = document.createElement("a");
        link.href = "#achievements";
        link.id = "achievements-link";
        link.textContent = "Achievements";
        nav.appendChild(link);
    }

    // Create Achievements section
    if (!document.querySelector("#achievements")) {
        const section = document.createElement("section");
        section.id = "achievements";
        section.className = "section";

        section.innerHTML = `
            <h2>🏆 Certificates & Achievements</h2>
            <p>Track your learning journey and celebrate your progress.</p>

            <div class="cards">
                <div class="card">
                    <h3>📚 Learning Progress</h3>
                    <h2 id="achievement-count">0 / 40</h2>
                    <div style="background:#25253d;border-radius:20px;height:14px;overflow:hidden;">
                        <div id="achievement-bar"
                             style="width:0%;height:100%;background:#9b7cff;transition:width .3s;">
                        </div>
                    </div>
                    <p id="achievement-message">Start learning to earn achievements!</p>
                </div>
            </div>

            <h3>🎖️ Achievement Badges</h3>

            <div class="cards" id="achievement-badges">
                <div class="card" data-milestone="10">
                    <h3>🥉 First Steps</h3>
                    <p>Complete 10 lessons.</p>
                    <strong class="badge-status">Locked</strong>
                </div>

                <div class="card" data-milestone="20">
                    <h3>🥈 Rising Learner</h3>
                    <p>Complete 20 lessons.</p>
                    <strong class="badge-status">Locked</strong>
                </div>

                <div class="card" data-milestone="30">
                    <h3>🥇 Skill Explorer</h3>
                    <p>Complete 30 lessons.</p>
                    <strong class="badge-status">Locked</strong>
                </div>

                <div class="card" data-milestone="40">
                    <h3>🏆 SKILLVERSE Champion</h3>
                    <p>Complete all 40 lessons.</p>
                    <strong class="badge-status">Locked</strong>
                </div>
            </div>

            <h3>📜 Your Learning Certificate</h3>

            <div class="card" id="certificate-card">
                <h3 id="certificate-title">Certificate Locked</h3>
                <p id="certificate-message">
                    Complete all 40 lessons to unlock your personal certificate.
                </p>
                <button id="print-certificate" disabled>
                    Print Certificate
                </button>
            </div>

            <p style="font-size:13px;opacity:.7;">
                This is a personal SKILLVERSE learning achievement certificate.
                It is not an accredited academic or government qualification.
            </p>
        `;

        const main = document.querySelector("main");
        const practice = document.querySelector("#practice");

        if (main && practice) {
            main.insertBefore(section, practice);
        } else if (main) {
            main.appendChild(section);
        }
    }

    function getCompletedLessons() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (Array.isArray(saved)) {
                return saved;
            }

            return [];
        } catch (error) {
            return [];
        }
    }

    function updateAchievements() {
        const completed = getCompletedLessons();
        const count = Math.min(completed.length, 40);
        const percentage = Math.round((count / 40) * 100);

        const countElement = document.querySelector("#achievement-count");
        const bar = document.querySelector("#achievement-bar");
        const message = document.querySelector("#achievement-message");

        if (countElement) {
            countElement.textContent = count + " / 40";
        }

        if (bar) {
            bar.style.width = percentage + "%";
        }

        if (message) {
            message.textContent =
                percentage + "% completed — " +
                (40 - count) + " lessons remaining.";
        }

        MILESTONES.forEach(function (milestone) {
            const card = document.querySelector(
                '[data-milestone="' + milestone + '"]'
            );

            if (!card) return;

            const status = card.querySelector(".badge-status");

            if (count >= milestone) {
                card.style.border = "2px solid #9b7cff";
                if (status) {
                    status.textContent = "✅ Unlocked";
                    status.style.color = "#9b7cff";
                }
            } else {
                card.style.border = "";
                if (status) {
                    status.textContent = "🔒 Locked";
                    status.style.color = "";
                }
            }
        });

        const certificateTitle =
            document.querySelector("#certificate-title");

        const certificateMessage =
            document.querySelector("#certificate-message");

        const printButton =
            document.querySelector("#print-certificate");

        if (count >= 40) {
            if (certificateTitle) {
                certificateTitle.textContent = "🏆 Certificate Unlocked!";
            }

            if (certificateMessage) {
                certificateMessage.textContent =
                    "Congratulations! You have completed all 40 SKILLVERSE lessons.";
            }

            if (printButton) {
                printButton.disabled = false;
            }
        } else {
            if (certificateTitle) {
                certificateTitle.textContent = "Certificate Locked";
            }

            if (certificateMessage) {
                certificateMessage.textContent =
                    "Complete all 40 lessons to unlock your personal certificate.";
            }

            if (printButton) {
                printButton.disabled = true;
            }
        }
    }

    // Print certificate
    document.addEventListener("click", function (event) {
        if (event.target.id !== "print-certificate") return;

        if (getCompletedLessons().length < 40) {
            alert("Please complete all 40 lessons first.");
            return;
        }

        const name =
            localStorage.getItem("svName") || "SKILLVERSE Learner";

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Please allow pop-ups to print your certificate.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SKILLVERSE Certificate</title>
                <style>
                    body {
                        font-family: Georgia, serif;
                        text-align: center;
                        padding: 35px;
                        background: #f5f2ff;
                    }
                    .certificate {
                        border: 10px double #7552bd;
                        padding: 45px 20px;
                        background: white;
                        max-width: 850px;
                        margin: auto;
                    }
                    h1 {
                        color: #493080;
                        font-size: 38px;
                    }
                    h2 {
                        color: #7552bd;
                        font-size: 30px;
                    }
                    .name {
                        font-size: 28px;
                        font-weight: bold;
                        border-bottom: 2px solid #7552bd;
                        display: inline-block;
                        padding: 10px 35px;
                    }
                    p {
                        font-size: 18px;
                        line-height: 1.7;
                    }
                    .footer {
                        margin-top: 50px;
                        font-size: 14px;
                    }
                    @media print {
                        body { background: white; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <h1>SKILLVERSE</h1>
                    <h2>Certificate of Learning Achievement</h2>
                    <p>This certificate is proudly presented to</p>
                    <div class="name">${escapeHTML(name)}</div>
                    <p>
                        For successfully completing all 40 beginner-friendly
                        lessons across Technology, Artificial Intelligence,
                        Creative Skills and Business Skills.
                    </p>
                    <h2>🏆 Congratulations!</h2>
                    <div class="footer">
                        Personal Learning Achievement<br>
                        SKILLVERSE — Learn. Create. Grow.<br>
                        This is not an accredited academic or government qualification.
                    </div>
                </div>
                <script>
                    window.onload = function () {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    });

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    // Refresh progress when lesson progress changes
    window.addEventListener("storage", updateAchievements);

    document.addEventListener("click", function () {
        setTimeout(updateAchievements, 300);
    });

    updateAchievements();
});
