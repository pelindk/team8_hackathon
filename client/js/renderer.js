class Renderer {
  constructor(containerId, width = 800, height = 600) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.app.view);
    }

    this.sprites = {};
    this.currentTheme = null;
    this.animationCallbacks = {};
  }

  // Load SVG as texture (for now, we'll use graphics as placeholders)
  async loadTheme(theme) {
    this.currentTheme = theme;
    // In a full implementation, this would load SVG files
    // For now, we'll create graphics programmatically
  }

  // Create a move sprite (rock, paper, or scissors)
  createMoveSprite(move, theme = 'modern') {
    // Use emoji text instead of drawn graphics to match the buttons
    const emojiMap = {
      rock: '🪨',
      paper: '📄',
      scissors: '✂️'
    };
    
    const text = new PIXI.Text(emojiMap[move] || '?', {
      fontFamily: 'Arial',
      fontSize: 120,
      fill: 0xffffff,
      align: 'center'
    });
    
    text.anchor.set(0.5);
    return text;
  }

  createModernSprite(move) {
    const graphics = new PIXI.Graphics();
    
    switch (move) {
      case 'rock':
        // Draw a pentagon for rock
        graphics.beginFill(0x8b8b8b);
        graphics.drawPolygon([
          0, -40,
          38, -12,
          24, 32,
          -24, 32,
          -38, -12
        ]);
        graphics.endFill();
        break;
        
      case 'paper':
        // Draw a rectangle for paper
        graphics.beginFill(0xf0f0f0);
        graphics.drawRect(-35, -45, 70, 90);
        graphics.endFill();
        // Add fold line
        graphics.lineStyle(2, 0xcccccc);
        graphics.moveTo(-35, 0);
        graphics.lineTo(35, 0);
        break;
        
      case 'scissors':
        // Draw scissors
        graphics.lineStyle(8, 0xff6b6b, 1);
        graphics.moveTo(-30, -30);
        graphics.lineTo(0, 0);
        graphics.lineTo(-30, 30);
        graphics.moveTo(30, -30);
        graphics.lineTo(0, 0);
        graphics.lineTo(30, 30);
        // Circles at ends
        graphics.beginFill(0xff6b6b);
        graphics.drawCircle(-30, -30, 8);
        graphics.drawCircle(-30, 30, 8);
        graphics.drawCircle(30, -30, 8);
        graphics.drawCircle(30, 30, 8);
        graphics.endFill();
        break;
    }
    
    return graphics;
  }

  createPlayfulSprite(move) {
    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    
    switch (move) {
      case 'rock':
        // Rounded rock with face
        graphics.beginFill(0x8b7355);
        graphics.drawCircle(0, 0, 45);
        graphics.endFill();
        
        // Eyes
        graphics.beginFill(0xffffff);
        graphics.drawCircle(-15, -10, 8);
        graphics.drawCircle(15, -10, 8);
        graphics.endFill();
        graphics.beginFill(0x000000);
        graphics.drawCircle(-15, -10, 4);
        graphics.drawCircle(15, -10, 4);
        graphics.endFill();
        
        // Smile
        graphics.lineStyle(3, 0x000000);
        graphics.arc(0, 5, 15, 0, Math.PI);
        break;
        
      case 'paper':
        // Paper with face
        graphics.beginFill(0xffffff);
        graphics.drawRoundedRect(-35, -45, 70, 90, 5);
        graphics.endFill();
        
        // Eyes
        graphics.beginFill(0x000000);
        graphics.drawCircle(-15, -15, 5);
        graphics.drawCircle(15, -15, 5);
        graphics.endFill();
        
        // Smile
        graphics.lineStyle(3, 0x000000);
        graphics.arc(0, 0, 15, 0, Math.PI);
        
        // Lines on paper
        graphics.lineStyle(1, 0xcccccc);
        for (let i = -30; i < 40; i += 10) {
          graphics.moveTo(-25, i);
          graphics.lineTo(25, i);
        }
        break;
        
      case 'scissors':
        // Scissors with face
        graphics.lineStyle(10, 0xff6b6b, 1, 0.5, true);
        graphics.moveTo(-30, -30);
        graphics.lineTo(0, 0);
        graphics.lineTo(-30, 30);
        graphics.moveTo(30, -30);
        graphics.lineTo(0, 0);
        graphics.lineTo(30, 30);
        
        // Handles with faces
        graphics.beginFill(0xff6b6b);
        graphics.drawCircle(-30, -30, 10);
        graphics.drawCircle(30, -30, 10);
        graphics.endFill();
        
        // Eyes on top handle
        graphics.beginFill(0xffffff);
        graphics.drawCircle(27, -32, 3);
        graphics.drawCircle(33, -32, 3);
        graphics.endFill();
        graphics.beginFill(0x000000);
        graphics.drawCircle(27, -32, 1.5);
        graphics.drawCircle(33, -32, 1.5);
        graphics.endFill();
        break;
    }
    
    container.addChild(graphics);
    return container;
  }

  // Animate idle state (floating/bobbing)
  animateIdle(sprite) {
    const startY = sprite.y;
    const ticker = (delta) => {
      sprite.y = startY + Math.sin(Date.now() / 500) * 10;
    };
    this.app.ticker.add(ticker);
    return ticker;
  }

  stopAnimation(ticker) {
    this.app.ticker.remove(ticker);
  }

  // Animate selection (scale and glow)
  animateSelect(sprite) {
    return new Promise((resolve) => {
      const timeline = [];
      const startScale = sprite.scale.x;
      const duration = 300;
      const startTime = Date.now();

      const ticker = (delta) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Scale up then down
        if (progress < 0.5) {
          sprite.scale.set(startScale + progress * 0.4);
        } else {
          sprite.scale.set(startScale + (1 - progress) * 0.4);
        }

        if (progress >= 1) {
          this.app.ticker.remove(ticker);
          sprite.scale.set(startScale);
          resolve();
        }
      };

      this.app.ticker.add(ticker);
    });
  }

  // Animate countdown
  showCountdown(number) {
    return new Promise((resolve) => {
      const text = new PIXI.Text(number === 0 ? 'GO!' : number.toString(), {
        fontFamily: 'Arial',
        fontSize: 120,
        fontWeight: 'bold',
        fill: number === 0 ? 0x00ff00 : 0xffffff,
        stroke: 0x000000,
        strokeThickness: 6
      });

      text.anchor.set(0.5);
      text.x = this.app.screen.width / 2;
      text.y = this.app.screen.height / 2;
      text.alpha = 0;

      this.app.stage.addChild(text);

      // Fade in and scale
      const duration = 500;
      const startTime = Date.now();

      const ticker = (delta) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        text.alpha = progress;
        text.scale.set(0.5 + progress * 0.5);

        if (progress >= 1) {
          this.app.ticker.remove(ticker);
          setTimeout(() => {
            this.app.stage.removeChild(text);
            resolve();
          }, 500);
        }
      };

      this.app.ticker.add(ticker);
    });
  }

  // Animate win condition (cutting, crushing, wrapping)
  animateWinCondition(winner, loser, condition) {
    return new Promise((resolve) => {
      switch (condition) {
        case 'scissors_cuts_paper':
          this.animateCut(winner, loser).then(resolve);
          break;
        case 'rock_crushes_scissors':
          this.animateCrush(winner, loser).then(resolve);
          break;
        case 'paper_wraps_rock':
          this.animateWrap(winner, loser).then(resolve);
          break;
        default:
          resolve();
      }
    });
  }

  animateCut(scissors, paper) {
    return new Promise((resolve) => {
      const duration = 1000;
      const startTime = Date.now();
      const startX = scissors.x;

      const ticker = (delta) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Move scissors toward paper
        scissors.x = startX + (paper.x - startX) * progress;
        scissors.rotation = Math.sin(progress * Math.PI * 4) * 0.3;

        // Fade out paper
        if (progress > 0.5) {
          paper.alpha = 1 - (progress - 0.5) * 2;
        }

        if (progress >= 1) {
          this.app.ticker.remove(ticker);
          resolve();
        }
      };

      this.app.ticker.add(ticker);
    });
  }

  animateCrush(rock, scissors) {
    return new Promise((resolve) => {
      const duration = 1000;
      const startTime = Date.now();
      const startY = rock.y;

      const ticker = (delta) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Move rock down
        rock.y = startY + (scissors.y - startY) * progress;

        // Squash scissors
        if (progress > 0.5) {
          scissors.scale.y = 1 - (progress - 0.5);
          scissors.alpha = 1 - (progress - 0.5) * 2;
        }

        if (progress >= 1) {
          this.app.ticker.remove(ticker);
          resolve();
        }
      };

      this.app.ticker.add(ticker);
    });
  }

  animateWrap(paper, rock) {
    return new Promise((resolve) => {
      const duration = 1000;
      const startTime = Date.now();

      const ticker = (delta) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Rotate paper around rock
        paper.x = rock.x + Math.cos(progress * Math.PI * 2) * 80 * (1 - progress);
        paper.y = rock.y + Math.sin(progress * Math.PI * 2) * 80 * (1 - progress);
        paper.rotation = progress * Math.PI * 2;

        // Fade out rock
        if (progress > 0.7) {
          rock.alpha = 1 - (progress - 0.7) * 3.33;
        }

        if (progress >= 1) {
          this.app.ticker.remove(ticker);
          resolve();
        }
      };

      this.app.ticker.add(ticker);
    });
  }

  // Clear stage
  clear() {
    this.app.stage.removeChildren();
  }

  // Resize renderer
  resize(width, height) {
    this.app.renderer.resize(width, height);
  }

  // Destroy renderer
  destroy() {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}
