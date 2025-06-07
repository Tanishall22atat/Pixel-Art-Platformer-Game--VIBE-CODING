// Wait for Kaboom to be fully initialized
window.addEventListener('load', () => {
    // Game constants
    const PLAYER_SPEED = 400
    const JUMP_FORCE = 700
    const GRAVITY = 1600
    const ENEMY_SPEED = 100
    const PLATFORM_SPEED = 150  // Speed for moving platform
    let SCORE = 0
    let HIGH_SCORE = localStorage.getItem('highScore') || 0

    // Add game scene
    k.scene("game", () => {
        // Set gravity
        k.setGravity(GRAVITY)

        // Add dark night sky background
        k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(0, 0, 40),  // Very dark blue
            k.fixed()
        ])

        // Add twinkling stars
        for (let i = 0; i < 100; i++) {  // Create 100 stars
            const starSize = k.rand(2, 4)
            const star = k.add([
                k.rect(starSize, starSize),
                k.pos(k.rand(0, k.width()), k.rand(0, k.height() * 0.9)),  // Don't place stars too low
                k.color(255, 255, 255),
                k.opacity(k.rand(0.5, 1)),
                k.fixed(),
                "star",
                {
                    twinkleSpeed: k.rand(1, 3),
                    baseOpacity: k.rand(0.5, 1)
                }
            ])

            // Make stars twinkle
            star.onUpdate(() => {
                star.opacity = star.baseOpacity * k.wave(0.3, 1, star.twinkleSpeed)
            })
        }

        // Function to create a shooting star
        function createShootingStar() {
            const startX = k.rand(-100, 0)  // Start slightly off-screen
            const startY = k.rand(0, k.height() * 0.5)  // Only in upper half
            const angle = k.rand(-30, -15)  // Diagonal angle
            const speed = k.rand(300, 500)
            const lifetime = k.rand(0.8, 1.2)

            // Create the shooting star head
            const star = k.add([
                k.rect(4, 4),
                k.pos(startX, startY),
                k.color(255, 255, 255),
                k.opacity(1),
                k.lifespan(lifetime),
                k.fixed(),
                {
                    angle: angle,
                    speed: speed,
                    initialOpacity: 1
                }
            ])

            // Update shooting star
            star.onUpdate(() => {
                // Move diagonally
                star.pos.x += Math.cos(star.angle * Math.PI / 180) * star.speed * k.dt()
                star.pos.y += Math.sin(star.angle * Math.PI / 180) * star.speed * k.dt()

                // Create trail
                for (let i = 0; i < 3; i++) {  // Create multiple trail particles
                    k.add([
                        k.rect(2, 2),
                        k.pos(
                            star.pos.x - i * 4 * Math.cos(star.angle * Math.PI / 180),
                            star.pos.y - i * 4 * Math.sin(star.angle * Math.PI / 180)
                        ),
                        k.color(255, 255, 255),
                        k.opacity(star.initialOpacity * (1 - i * 0.2)),  // Fade out trail
                        k.lifespan(0.1),
                        k.fixed()
                    ])
                }

                // Fade out as it reaches the end of its life
                star.opacity = k.wave(0.5, 1, k.time() * 5)
            })
        }

        // Create shooting stars regularly
        let shootingStarTimer = 0
        k.onUpdate(() => {
            shootingStarTimer += k.dt()
            if (shootingStarTimer >= k.rand(1, 3)) {  // Create shooting star every 1-3 seconds
                createShootingStar()
                shootingStarTimer = 0
            }
        })

        // Add subtle star clusters (distant galaxies)
        for (let i = 0; i < 5; i++) {
            const clusterX = k.rand(0, k.width())
            const clusterY = k.rand(0, k.height() * 0.7)
            
            // Create a cluster of tiny stars
            for (let j = 0; j < 20; j++) {
                const offset = 30
                k.add([
                    k.rect(1, 1),
                    k.pos(
                        clusterX + k.rand(-offset, offset),
                        clusterY + k.rand(-offset/2, offset/2)
                    ),
                    k.color(255, 255, 255),
                    k.opacity(k.rand(0.2, 0.4)),
                    k.fixed()
                ])
            }
        }

        // Add UI panel with cute style
        k.add([
            k.rect(220, 100),
            k.pos(10, 10),
            k.color(147, 112, 219),  // Medium purple for better visibility
            k.opacity(0.9),
            k.outline(4, 138, 43, 226),  // Blue violet outline
            k.fixed()
        ])

        // Add pixel style score display with better contrast
        const scoreText = k.add([
            k.text(`SCORE: ${SCORE}`, {
                size: 24,
                font: 'monospace',
                width: 200
            }),
            k.pos(25, 25),
            k.color(255, 255, 255),  // Pure white for better readability
            k.fixed()
        ])

        const highScoreText = k.add([
            k.text(`HIGH SCORE: ${HIGH_SCORE}`, {
                size: 24,
                font: 'monospace',
                width: 200
            }),
            k.pos(25, 60),
            k.color(255, 255, 255),  // Pure white for better readability
            k.fixed()
        ])

        // Score panel without decorative elements

        // Add cute pixel player (bunny style) with darker colors
        const player = k.add([
            k.rect(32, 32),
            k.pos(k.width() / 2, k.height() - 100),
            k.color(219, 112, 147),  // Darker pink (pale violet red)
            k.outline(4, 199, 21, 133),  // Medium violet red outline
            k.area(),
            k.body(),
            "player"
        ])

        // Add bunny ears with matching darker colors
        function updateBunnyEars() {
            const leftEar = k.add([
                k.rect(8, 16),
                k.pos(player.pos.x + 4, player.pos.y - 14),
                k.color(219, 112, 147),  // Match darker body pink
                k.outline(2, 199, 21, 133),  // Match darker outline
                k.fixed()
            ])

            const rightEar = k.add([
                k.rect(8, 16),
                k.pos(player.pos.x + 20, player.pos.y - 14),
                k.color(219, 112, 147),  // Match darker body pink
                k.outline(2, 199, 21, 133),  // Match darker outline
                k.fixed()
            ])

            return [leftEar, rightEar]
        }

        let bunnyEars = updateBunnyEars()

        // Update bunny ears position
        player.onUpdate(() => {
            bunnyEars.forEach(ear => ear.destroy())
            bunnyEars = updateBunnyEars()
        })

        // Platform configurations with cute style
        const platforms = [
            { pos: [k.width() / 2, k.height() - 50], size: [k.width(), 20], enemies: 1 },
            { pos: [100, k.height() - 200], size: [300, 20], enemies: 1 },
            { pos: [300, k.height() - 400], size: [200, 20], enemies: 0, hasFlag: true },
            { pos: [600, k.height() - 300], size: [300, 20], enemies: 1 }
        ]

        let coinCount = 0;  // Track number of coins in game
        let collectedPlatforms = new Set();  // Track platforms where coins were collected

        // Create platforms with pixel art style
        platforms.forEach((platform, idx) => {
            const platformObj = k.add([
                k.rect(platform.size[0], platform.size[1]),
                k.pos(platform.pos[0] - platform.size[0]/2, platform.pos[1]),
                k.color(k.rgb(176, 224, 230)),  // Powder blue
                k.outline(4, k.rgb(135, 206, 235)),  // Sky blue outline
                k.area(),
                platform.isMoving ? k.pos() : k.body({ isStatic: true }),
                "platform",
                {
                    startY: platform.pos[1],
                    startX: platform.pos[0] - platform.size[0]/2,
                    direction: 1,
                    isMoving: platform.isMoving || false,
                    moveDistance: 144,
                    platformIndex: idx
                }
            ])

            // Add platform decorations (pixel flowers)
            for (let i = 0; i < platform.size[0]; i += 40) {
                if (k.rand(0, 100) < 30) {  // 30% chance for flower
                    k.add([
                        k.rect(8, 8),
                        k.pos(platformObj.pos.x + i, platformObj.pos.y - 12),
                        k.color(255, 182, 193),  // Pink
                        k.outline(2, 255, 105, 180),
                        k.fixed()
                    ])

                    // Flower petals
                    for (let angle = 0; angle < 360; angle += 90) {
                        k.add([
                            k.rect(6, 6),
                            k.pos(
                                platformObj.pos.x + i + 4 + Math.cos(angle * Math.PI / 180) * 6,
                                platformObj.pos.y - 12 + 4 + Math.sin(angle * Math.PI / 180) * 6
                            ),
                            k.color(255, 105, 180),  // Hot pink
                            k.fixed()
                        ])
                    }
                }
            }

            // Add victory flag with cute style
            if (platform.hasFlag) {
                const flagPole = k.add([
                    k.rect(4, 56),
                    k.pos(platform.pos[0] - platform.size[0]/2 + 28, platform.pos[1] - 56),
                    k.color(255, 215, 0),  // Gold
                    k.outline(2, 218, 165, 32),
                    k.area(),
                ])

                const flag = k.add([
                    k.rect(32, 24),
                    k.pos(platform.pos[0] - platform.size[0]/2 + 32, platform.pos[1] - 56),
                    k.color(255, 182, 193),  // Pink
                    k.outline(2, 255, 105, 180),
                    k.area(),
                    "victory"
                ])

                // Add pixel heart on flag
                k.add([
                    k.rect(12, 12),
                    k.pos(flag.pos.x + 10, flag.pos.y + 6),
                    k.color(255, 105, 180),
                    k.fixed()
                ])
            }

            // Add cute enemies (little pixel hearts)
            for (let i = 0; i < platform.enemies; i++) {
                const startX = platform.pos[0] - platform.size[0]/3
                const enemy = k.add([
                    k.rect(28, 28),  // Slightly bigger
                    k.pos(startX, platform.pos[1] - 35),
                    k.color(64, 0, 64),  // Dark purple base
                    k.outline(3, k.rgb(128, 0, 128)),  // Purple outline
                    k.area(),
                    k.body({ isStatic: true }),
                    "enemy",
                    {
                        direction: 1,
                        platformLeft: platform.pos[0] - platform.size[0]/2 + 15,
                        platformRight: platform.pos[0] + platform.size[0]/2 - 45,
                        time: 0
                    }
                ])

                // Add glowing eyes
                const leftEye = k.add([
                    k.rect(6, 6),
                    k.pos(enemy.pos.x + 6, enemy.pos.y + 8),
                    k.color(255, 0, 0),  // Red eyes
                    k.opacity(0.8),
                    k.fixed(),
                    {
                        baseX: enemy.pos.x + 6,
                        baseY: enemy.pos.y + 8
                    }
                ])

                const rightEye = k.add([
                    k.rect(6, 6),
                    k.pos(enemy.pos.x + 16, enemy.pos.y + 8),
                    k.color(255, 0, 0),  // Red eyes
                    k.opacity(0.8),
                    k.fixed(),
                    {
                        baseX: enemy.pos.x + 16,
                        baseY: enemy.pos.y + 8
                    }
                ])

                // Add spiky details
                const spikes = []
                for (let j = 0; j < 4; j++) {
                    const spike = k.add([
                        k.rect(4, 8),
                        k.pos(enemy.pos.x + 4 + (j * 7), enemy.pos.y - 4),
                        k.color(128, 0, 128),  // Purple spikes
                        k.fixed(),
                        {
                            baseX: enemy.pos.x + 4 + (j * 7),
                            baseY: enemy.pos.y - 4
                        }
                    ])
                    spikes.push(spike)
                }

                // Add dark aura particles
                function createAuraParticle() {
                    k.add([
                        k.rect(3, 3),
                        k.pos(
                            enemy.pos.x + k.rand(0, 28),
                            enemy.pos.y + k.rand(0, 28)
                        ),
                        k.color(128, 0, 128),  // Purple particles
                        k.opacity(k.rand(0.3, 0.6)),
                        k.lifespan(0.5),
                        k.fixed(),
                        {
                            update() {
                                this.pos.y -= 30 * k.dt()
                                this.opacity = k.wave(0.2, 0.5, k.time() * 4)
                            }
                        }
                    ])
                }

                // Enemy movement and effects
                enemy.onUpdate(() => {
                    enemy.time += k.dt()
                    
                    // Move horizontally with menacing float effect
                    enemy.pos.x += ENEMY_SPEED * enemy.direction * k.dt()
                    enemy.pos.y += Math.sin(enemy.time * 5) * 0.5  // Subtle floating

                    // Update eye positions with slight movement
                    leftEye.pos.x = leftEye.baseX + enemy.pos.x - enemy.pos.x
                    leftEye.pos.y = leftEye.baseY + enemy.pos.y - enemy.pos.y + Math.sin(enemy.time * 6)
                    rightEye.pos.x = rightEye.baseX + enemy.pos.x - enemy.pos.x
                    rightEye.pos.y = rightEye.baseY + enemy.pos.y - enemy.pos.y + Math.sin(enemy.time * 6)

                    // Update spike positions
                    spikes.forEach((spike, idx) => {
                        spike.pos.x = spike.baseX + enemy.pos.x - enemy.pos.x
                        spike.pos.y = spike.baseY + enemy.pos.y - enemy.pos.y + Math.sin(enemy.time * 8 + idx) * 2
                    })

                    // Pulse effect on the enemy
                    enemy.color = k.rgb(
                        64 + Math.sin(enemy.time * 4) * 20,
                        0,
                        64 + Math.sin(enemy.time * 4) * 20
                    )

                    // Glow effect on eyes
                    leftEye.opacity = k.wave(0.6, 1, enemy.time * 4)
                    rightEye.opacity = k.wave(0.6, 1, enemy.time * 4)

                    // Create aura particles
                    if (k.rand(0, 100) < 20) {  // 20% chance each frame
                        createAuraParticle()
                    }

                    if (enemy.pos.x <= enemy.platformLeft || enemy.pos.x >= enemy.platformRight) {
                        enemy.direction *= -1
                    }
                })
            }
        })

        // Function to spawn cute collectibles (stars)
        function spawnCollectible() {
            // Calculate base platform coins (5 or 6 randomly)
            const baseCoins = Math.floor(k.rand(5, 7));  // Random number between 5 and 6
            
            // Calculate total possible coins (base platform + other platforms)
            const totalPossibleCoins = baseCoins + 2 + 3 + 2;  // Base + Platform1 + Platform2 + Top Platform
            
            // Only spawn if we don't have enough coins
            if (coinCount >= totalPossibleCoins) return;

            // Ensure each platform gets its coins
            platforms.forEach((platform, platformIndex) => {
                // Skip if this platform's coins were collected
                if (collectedPlatforms.has(platformIndex)) return;

                let platformCoins = 0;
                // Count existing coins on this platform
                k.get("collectible").forEach(coin => {
                    if (coin.pos.y < platform.pos[1] && 
                        coin.pos.y > platform.pos[1] - 100 &&
                        coin.pos.x > platform.pos[0] - platform.size[0]/2 &&
                        coin.pos.x < platform.pos[0] + platform.size[0]/2) {
                        platformCoins++;
                    }
                });

                // Determine how many coins this platform should have
                let coinsNeeded;
                if (platformIndex === 0) {  // Base platform
                    coinsNeeded = baseCoins;
                } else if (platformIndex === 2) {  // Second floating platform
                    coinsNeeded = 3;
                } else {  // Other platforms
                    coinsNeeded = 2;
                }

                // Add coins if needed
                while (platformCoins < coinsNeeded) {
                    const x = k.rand(
                        platform.pos[0] - platform.size[0]/2 + 20,
                        platform.pos[0] + platform.size[0]/2 - 20
                    )
                    const y = platform.pos[1] - k.rand(50, 100)

                    // Create star collectible
                    const star = k.add([
                        k.rect(20, 20),
                        k.pos(x, y),
                        k.color(255, 223, 0),  // Gold
                        k.outline(3, 218, 165, 32),
                        k.area(),
                        "collectible",
                        {
                            value: 10,
                            platformIndex: platformIndex
                        }
                    ])

                    // Add star points
                    for (let angle = 0; angle < 360; angle += 72) {
                        k.add([
                            k.rect(6, 6),
                            k.pos(
                                star.pos.x + 10 + Math.cos(angle * Math.PI / 180) * 12,
                                star.pos.y + 10 + Math.sin(angle * Math.PI / 180) * 12
                            ),
                            k.color(255, 215, 0),
                            k.fixed()
                        ])
                    }

                    platformCoins++
                    coinCount++
                }
            })
        }

        // Spawn initial collectibles
        spawnCollectible()

        // Celebration function with cute effects
        function celebrate() {
            // Pastel color palette
            const pastelColors = [
                [183, 217, 255],  // Pastel blue
                [255, 198, 255],  // Pastel pink
                [198, 255, 198],  // Pastel green
                [255, 223, 251],  // Light pastel pink
                [208, 255, 255],  // Light pastel blue
                [220, 255, 220],  // Light pastel green
                [255, 209, 220],  // Baby pink
                [191, 231, 255],  // Baby blue
                [201, 255, 229]   // Mint green
            ]

            // Create heart-shaped particles in pastel colors
            for (let i = 0; i < 50; i++) {
                const color = pastelColors[Math.floor(k.rand(0, pastelColors.length))]
                const heart = k.add([
                    k.rect(12, 12),
                    k.pos(player.pos.x, player.pos.y),
                    k.color(color[0], color[1], color[2]),
                    k.outline(2, k.rgb(255, 255, 255)),  // Soft white outline
                    k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(100, 300)),
                    k.lifespan(2),
                    k.scale(1),
                    "heart",
                    {
                        spinSpeed: k.rand(-5, 5),
                        initialScale: k.rand(0.8, 1.2)
                    }
                ])

                // Make hearts spin and pulse
                heart.onUpdate(() => {
                    heart.angle += heart.spinSpeed
                    heart.scale = heart.initialScale * k.wave(0.8, 1.2, k.time() * 3)
                    heart.opacity = k.wave(0.7, 1, k.time() * 4)
                })
            }

            // Add sparkle effects in pastel colors
            for (let i = 0; i < 30; i++) {
                const color = pastelColors[Math.floor(k.rand(0, pastelColors.length))]
                const sparkle = k.add([
                    k.rect(4, 4),
                    k.pos(
                        player.pos.x + k.rand(-50, 50),
                        player.pos.y + k.rand(-50, 50)
                    ),
                    k.color(color[0], color[1], color[2]),
                    k.opacity(1),
                    k.lifespan(1.5),
                    k.scale(1),
                    {
                        initialY: player.pos.y + k.rand(-50, 50),
                        floatSpeed: k.rand(1, 2)
                    }
                ])

                // Make sparkles float up and twinkle
                sparkle.onUpdate(() => {
                    sparkle.pos.y -= sparkle.floatSpeed
                    sparkle.opacity = k.wave(0.3, 1, k.time() * 5)
                    sparkle.scale = k.wave(0.5, 1, k.time() * 4)
                })
            }

            // Add cute victory text with pastel gradient effect
            const victoryText = k.add([
                k.text("YAY!", {
                    size: 48,
                    font: 'monospace'
                }),
                k.pos(k.width()/2, k.height()/2),
                k.anchor("center"),
                k.color(255, 198, 255),  // Start with pastel pink
                k.opacity(0),
                k.fixed(),
                "celebration",
                {
                    colorIndex: 0,
                    colorTime: 0
                }
            ])

            // Make text fade in and change colors
            victoryText.onUpdate(() => {
                victoryText.colorTime += k.dt()
                if (victoryText.opacity < 1) {
                    victoryText.opacity += 0.05
                }
                
                // Cycle through pastel colors
                const colorIndex = Math.floor(victoryText.colorTime) % pastelColors.length
                const nextColorIndex = (colorIndex + 1) % pastelColors.length
                const t = victoryText.colorTime % 1
                
                victoryText.color = k.rgb(
                    k.lerp(pastelColors[colorIndex][0], pastelColors[nextColorIndex][0], t),
                    k.lerp(pastelColors[colorIndex][1], pastelColors[nextColorIndex][1], t),
                    k.lerp(pastelColors[colorIndex][2], pastelColors[nextColorIndex][2], t)
                )
                
                victoryText.pos.y += Math.sin(k.time() * 5) * 0.5
            })

            // Add floating pastel stars
            for (let i = 0; i < 20; i++) {
                const color = pastelColors[Math.floor(k.rand(0, pastelColors.length))]
                const star = k.add([
                    k.rect(8, 8),
                    k.pos(
                        k.rand(0, k.width()),
                        k.height() + k.rand(0, 50)
                    ),
                    k.color(color[0], color[1], color[2]),
                    k.opacity(0.8),
                    k.lifespan(3),
                    {
                        speed: k.rand(100, 200),
                        spinSpeed: k.rand(-3, 3)
                    }
                ])

                star.onUpdate(() => {
                    star.pos.y -= star.speed * k.dt()
                    star.angle += star.spinSpeed
                    star.opacity = k.wave(0.4, 0.8, k.time() * 3)
                })
            }

            // Restart game after celebration
            k.wait(3, () => {
                k.go("game")
            })
        }

        // Add collision detection for victory flag
        player.onCollide("victory", () => {
            // Update high score
            if (SCORE > HIGH_SCORE) {
                HIGH_SCORE = SCORE
                localStorage.setItem('highScore', HIGH_SCORE)
            }
            
            // Trigger celebration
            celebrate()
            
            // Disable player controls
            player.paused = true
        })

        // Collision with collectibles
        player.onCollide("collectible", (collectible) => {
            SCORE += collectible.value
            scoreText.text = `SCORE: ${SCORE}`
            if (SCORE > HIGH_SCORE) {
                HIGH_SCORE = SCORE
                localStorage.setItem('highScore', HIGH_SCORE)
                highScoreText.text = `HIGH SCORE: ${HIGH_SCORE}`
            }
            
            // Add rainbow burst effect
            const colors = [
                [255, 182, 193],  // Pink
                [255, 218, 185],  // Peach
                [255, 255, 224],  // Light yellow
                [176, 224, 230],  // Powder blue
                [221, 160, 221],  // Plum
            ]
            
            for (let i = 0; i < 8; i++) {
                const angle = (i * 360 / 8) * (Math.PI / 180)
                const color = colors[i % colors.length]
                k.add([
                    k.rect(8, 8),
                    k.pos(collectible.pos.x + 10, collectible.pos.y + 10),
                    k.color(color[0], color[1], color[2]),
                    k.opacity(1),
                    k.lifespan(0.5),
                    k.move(k.Vec2.fromAngle(angle), 200),
                    {
                        update() {
                            this.opacity = k.wave(0.5, 1, k.time() * 8)
                            this.angle += 10
                        }
                    }
                ])
            }

            // Add score popup with cute bounce
            k.add([
                k.text("+10", {
                    size: 16,
                    font: 'monospace',
                }),
                k.pos(collectible.pos.x, collectible.pos.y),
                k.color(255, 105, 180),  // Hot pink
                k.opacity(1),
                k.lifespan(1),
                {
                    update() {
                        this.pos.y -= 2
                        this.pos.x += Math.sin(k.time() * 10) * 2
                        this.opacity = k.wave(0.5, 1, k.time() * 4)
                    }
                }
            ])

            // Mark this platform as collected
            collectedPlatforms.add(collectible.platformIndex);
            
            k.destroy(collectible)
            coinCount--;
        })

        // Function to restart game
        function restartGame() {
            if (SCORE > HIGH_SCORE) {
                HIGH_SCORE = SCORE
                localStorage.setItem('highScore', HIGH_SCORE)
            }
            SCORE = 0
            coinCount = 0
            collectedPlatforms.clear()  // Reset collected platforms on game restart
            k.go("game")
        }

        // Collision with enemies
        player.onCollide("enemy", () => {
            // Add cute death effect with hearts and stars
            const colors = [
                [255, 182, 193],  // Pink
                [255, 218, 185],  // Peach
                [255, 255, 224],  // Light yellow
                [176, 224, 230],  // Powder blue
            ]
            
            // Add "Oops!" text
            k.add([
                k.text("Oops!", {
                    size: 32,
                    font: 'monospace'
                }),
                k.pos(player.pos.x, player.pos.y - 40),
                k.color(255, 105, 180),
                k.opacity(1),
                k.lifespan(1),
                {
                    update() {
                        this.pos.y -= 2
                        this.opacity = k.wave(0.5, 1, k.time() * 4)
                    }
                }
            ])

            // Add heart burst
            for (let i = 0; i < 12; i++) {
                const angle = (i * 360 / 12) * (Math.PI / 180)
                const color = colors[i % colors.length]
                k.add([
                    k.rect(12, 12),
                    k.pos(player.pos.x + 16, player.pos.y + 16),
                    k.color(color[0], color[1], color[2]),
                    k.opacity(0.8),
                    k.lifespan(1),
                    k.move(k.Vec2.fromAngle(angle), 150),
                    {
                        update() {
                            this.angle += 5
                            this.opacity = k.wave(0.3, 0.8, k.time() * 4)
                        }
                    }
                ])
            }

            // Add sparkle effect
            for (let i = 0; i < 15; i++) {
                k.add([
                    k.rect(4, 4),
                    k.pos(player.pos.x + 16, player.pos.y + 16),
                    k.color(255, 255, 255),
                    k.opacity(0.8),
                    k.lifespan(0.8),
                    k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(50, 150)),
                    {
                        update() {
                            this.opacity = k.wave(0.3, 0.8, k.time() * 6)
                        }
                    }
                ])
            }

            // Wait a moment before restarting
            k.wait(1, () => {
                restartGame()
            })
        })

        // Player movement
        k.onKeyDown("left", () => {
            player.move(-PLAYER_SPEED, 0)
            // Add sparkle trail when moving
            if (k.rand(0, 100) < 30) {  // 30% chance to spawn sparkle
                k.add([
                    k.rect(4, 4),
                    k.pos(player.pos.x + 32, player.pos.y + k.rand(0, 32)),
                    k.color(255, 223, 186),  // Soft peach color
                    k.opacity(0.8),
                    k.lifespan(0.5),
                    k.scale(1),
                    {
                        update() {
                            this.scale = k.wave(0.5, 1, k.time() * 5)
                            this.opacity = k.wave(0.3, 0.8, k.time() * 4)
                        }
                    }
                ])
            }
        })

        k.onKeyDown("right", () => {
            player.move(PLAYER_SPEED, 0)
            // Add sparkle trail when moving
            if (k.rand(0, 100) < 30) {  // 30% chance to spawn sparkle
                k.add([
                    k.rect(4, 4),
                    k.pos(player.pos.x, player.pos.y + k.rand(0, 32)),
                    k.color(255, 223, 186),  // Soft peach color
                    k.opacity(0.8),
                    k.lifespan(0.5),
                    k.scale(1),
                    {
                        update() {
                            this.scale = k.wave(0.5, 1, k.time() * 5)
                            this.opacity = k.wave(0.3, 0.8, k.time() * 4)
                        }
                    }
                ])
            }
        })

        k.onKeyPress("space", () => {
            if (player.isGrounded()) {
                player.jump(JUMP_FORCE)
                // Add jump effect
                k.add([
                    k.rect(20, 4),
                    k.pos(player.pos.x + 6, player.pos.y + 32),
                    k.color(255, 255, 255),
                    k.opacity(0.5),
                    k.lifespan(0.2)
                ])
            }
        })

        // Keep player in bounds
        player.onUpdate(() => {
            if (player.pos.x < 0) {
                player.pos.x = 0
            }
            if (player.pos.x > k.width() - 32) {
                player.pos.x = k.width() - 32
            }

            if (player.pos.y > k.height()) {
                restartGame()
            }
        })

        // Add floating hearts in background
        function createFloatingHeart() {
            const heart = k.add([
                k.rect(8, 8),
                k.pos(k.rand(0, k.width()), k.height() + 10),
                k.color(255, 182, 193),  // Light pink
                k.outline(2, 255, 105, 180),  // Hot pink outline
                k.opacity(0.6),
                k.fixed(),
                "decorative",
                {
                    speed: k.rand(20, 40),
                    wobbleSpeed: k.rand(1, 2),
                    startX: k.rand(0, k.width())
                }
            ])

            heart.onUpdate(() => {
                heart.pos.y -= heart.speed * k.dt()
                heart.pos.x = heart.startX + Math.sin(k.time() * heart.wobbleSpeed) * 10
                heart.opacity = k.wave(0.4, 0.6, k.time() * 2)
                
                if (heart.pos.y < -10) {
                    heart.pos.y = k.height() + 10
                }
            })
        }

        // Create initial floating hearts
        for (let i = 0; i < 8; i++) {
            createFloatingHeart()
        }

        // Add cute flower decorations on platforms
        platforms.forEach(platform => {
            const flowerCount = Math.floor(platform.size[0] / 40)  // One flower every 40 pixels
            for (let i = 0; i < flowerCount; i++) {
                const x = platform.pos[0] - platform.size[0]/2 + (i * 40) + k.rand(5, 35)
                const flowerColors = [
                    [255, 182, 193],  // Pink
                    [255, 218, 185],  // Peach
                    [255, 255, 224],  // Light yellow
                    [176, 224, 230]   // Light blue
                ]
                const color = flowerColors[Math.floor(k.rand(0, flowerColors.length))]

                // Flower center
                const flower = k.add([
                    k.rect(6, 6),
                    k.pos(x, platform.pos[1] - 8),
                    k.color(255, 223, 0),  // Yellow center
                    k.fixed(),
                    "decorative",
                    {
                        time: k.rand(0, 100)
                    }
                ])

                // Flower petals
                for (let angle = 0; angle < 360; angle += 90) {
                    k.add([
                        k.rect(5, 5),
                        k.pos(
                            x + Math.cos(angle * Math.PI / 180) * 5,
                            platform.pos[1] - 8 + Math.sin(angle * Math.PI / 180) * 5
                        ),
                        k.color(color[0], color[1], color[2]),
                        k.fixed(),
                        "decorative"
                    ])
                }

                // Make flowers sway
                flower.onUpdate(() => {
                    flower.time += k.dt()
                    flower.pos.y += Math.sin(flower.time * 2) * 0.3
                })
            }
        })

        // Add sparkle effects that occasionally appear
        k.onUpdate(() => {
            if (k.rand(0, 100) < 2) {  // 2% chance each frame
                const sparkle = k.add([
                    k.rect(3, 3),
                    k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
                    k.color(255, 255, 255),
                    k.opacity(1),
                    k.lifespan(0.8),
                    k.scale(1),
                    "decorative",
                    {
                        update() {
                            this.scale = k.wave(0.5, 1, k.time() * 5)
                            this.opacity = k.wave(0.3, 1, k.time() * 4)
                        }
                    }
                ])
            }
        })

        // Add rainbow trail to player jumps
        k.onKeyPress("space", () => {
            if (player.isGrounded()) {
                const colors = [
                    [255, 182, 193],  // Pink
                    [255, 218, 185],  // Peach
                    [255, 255, 224],  // Light yellow
                    [176, 224, 230]   // Light blue
                ]
                
                for (let i = 0; i < 8; i++) {
                    const color = colors[i % colors.length]
                    k.add([
                        k.rect(4, 4),
                        k.pos(
                            player.pos.x + k.rand(0, 32),
                            player.pos.y + 32
                        ),
                        k.color(color[0], color[1], color[2]),
                        k.opacity(0.8),
                        k.lifespan(0.5),
                        k.move(k.Vec2.fromAngle(k.rand(220, 320)), k.rand(100, 200)),
                        "decorative",
                        {
                            update() {
                                this.opacity = k.wave(0.3, 0.8, k.time() * 4)
                            }
                        }
                    ])
                }
            }
        })

        // Add floating bubbles
        function createBubble() {
            const size = k.rand(8, 16)
            const bubble = k.add([
                k.rect(size, size),
                k.pos(k.rand(0, k.width()), k.height() + 10),
                k.color(255, 255, 255),
                k.opacity(0.2),
                k.outline(1, k.rgb(255, 255, 255)),
                k.fixed(),
                "decorative",
                {
                    speed: k.rand(30, 50),
                    wobbleSpeed: k.rand(1, 2),
                    startX: k.rand(0, k.width()),
                    size: size
                }
            ])

            // Add shine to bubble
            k.add([
                k.rect(3, 3),
                k.pos(bubble.pos.x + size * 0.7, bubble.pos.y + size * 0.3),
                k.color(255, 255, 255),
                k.opacity(0.6),
                k.fixed(),
                "decorative"
            ])

            bubble.onUpdate(() => {
                bubble.pos.y -= bubble.speed * k.dt()
                bubble.pos.x = bubble.startX + Math.sin(k.time() * bubble.wobbleSpeed) * 15
                bubble.opacity = k.wave(0.1, 0.3, k.time() * 2)
                
                if (bubble.pos.y < -20) {
                    bubble.pos.y = k.height() + 10
                    bubble.startX = k.rand(0, k.width())
                }
            })
        }

        // Create initial bubbles
        for (let i = 0; i < 10; i++) {
            createBubble()
        }

        // Make some platforms rainbow colored
        platforms.forEach((platform, idx) => {
            if (idx % 2 === 1) {  // Every other platform
                const platformObj = k.get("platform")[idx]
                platformObj.onUpdate(() => {
                    const hue = (k.time() * 60) % 360  // Full color cycle every 6 seconds
                    const [r, g, b] = hslToRgb(hue / 360, 0.3, 0.8)  // Soft pastel colors
                    platformObj.color = k.rgb(r, g, b)
                })
            }
        })

        // Helper function to convert HSL to RGB
        function hslToRgb(h, s, l) {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
    })

    // Start the game
    k.go("game")
}); 