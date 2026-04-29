/*:
 * @target MZ
 * @author ManuGamingCreations
 * @url https://manugamingcreations.itch.io
 * @plugindesc [0.1][EN] Battle Transition Ultra MZ
 * 
 * @help
 * 
 * [NOTES]
 * Please note the plugin is still under development, only stable versions will be distributed.
 * 
 * [REQUIRED !] Pïxi filters plugin
 * Grab here: https://github.com/pixijs/filters/releases/tag/v5.2.1
 * Or grab the Visutella one: https://visustellamz.itch.io/action-sequence-impact (it's under "Download Demo" section 'Pixi JS Filters library)
 * 
 * [PLUGIN EFFECT]
 * The plugin will change the default battle transition to a "Screen Shattering" one.
 * 
 * [BUG REPORT]
 * Please report bugs through Patreon messaging (https://patreon.com/manugamingcreations)
 *
*/

class ShatterPoint {
  constructor(x, y, minX, maxX, minY, maxY, column, row) {
    this.x = x;
    this.y = y;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
    this.column = column;
    this.row = row;
  }

  isTopLeft() {
    return this.x == this.minX && this.y == this.minY;
  }

  isTopRight() {
    return this.x == this.maxX && this.y == this.minY;
  }

  isBottomLeft() {
    return this.x == this.minX && this.y == this.maxY;
  }
  
  isBottomRight() {
    return this.x == this.maxX && this.y == this.maxY;
  }

  isTop() {
    return this.y == this.minY;
  }

  isBottom() {
    return this.y == this.maxY;
  }

  isRight() {
    return this.x == this.maxX;
  }

  isLeft() {
    return this.x == this.minX;
  }

  randomize(amplitudeX, amplitudeY) {
    if(this.isTopLeft() || this.isTopRight() || this.isBottomLeft() || this.isBottomRight()) {
      console.log('border');
      return;
    }
    if(this.isTop() || this.isBottom()) {
      this.randomizeX(amplitudeX);
      return;
    }
    if(this.isLeft() || this.isRight()) {
      this.randomizeY(amplitudeY);
      return;
    }
    this.randomizeX(amplitudeX);
    this.randomizeY(amplitudeY);
  }

  randomizeX(amplitudeX) {
    const min = this.x - amplitudeX;
    const max = this.x + amplitudeX;
    const delta = max - min;
    const randDelta = Math.random() * delta;
    this.x = min + randDelta;
  }

  randomizeY(amplitudeY) {
    const min = this.y - amplitudeY;
    const max = this.y + amplitudeY;
    const delta = max - min;
    const randDelta = Math.random() * delta;
    this.y = min + randDelta;
  }

  toArray() {
    return [this.x, this.y];
  }
}

class ShatterTriangle {
  constructor(shatterPointsArray) {
    if(!(shatterPointsArray instanceof Array)) {
      console.error('Argument must be an array');
      return null;
    }
    if(shatterPointsArray.length < 3) {
      console.error('Array must have a length of 3 at least');
      return null;
    }
    if(shatterPointsArray.length > 3) {
      console.warn('Only first 3 elements of array will be used.');
    }
    for(const point of shatterPointsArray) {
      if(!(point instanceof ShatterPoint)) {
        console.error('Array not containing only ShatterPoint objects. Errors may occur.');
        break;
      }
    }
    this.points = shatterPointsArray;
  }

  getLeftX() {
    let x = this.points[0].x;
    for(const point of this.points) {
      if(point.x < x) x = point.x;
    }
    return x;
  }

  getTopY() {
    let y = this.points[0].y;
    for(const point of this.points) {
      if(point.y < y) y = point.y;
    }
    return y;
  }

  toPolygonPointsArray() {
    const polygonPointsArray = [];
    for(const point of this.points) {
      polygonPointsArray.push(...point.toArray())
    }
    return polygonPointsArray;
  }

  makeSprite(color, alpha) {
    const sprite = new PIXI.Graphics();
    sprite.beginFill(color, alpha);
    sprite.drawPolygon(...this.toPolygonPointsArray());
    sprite.endFill();
    return sprite;
  }

  test() {
    this.points = [
      new ShatterPoint(0, 0, 0, 816, 0, 624, 0, 0),
      new ShatterPoint(130, 0, 0, 816, 0, 624, 0, 0),
      new ShatterPoint(0, 130, 0, 816, 0, 624, 0, 0)
    ];
    const spr = this.makeSprite(0xFF0000, 1);
    window.spr = spr;
    SceneManager._scene.addChild(spr);
  }
}

class ShatterGrid {
  constructor(columns, rows, width, height) {
    this._container = new Sprite();
    $gameTemp.currentShatterEffectGridContainer = this._container;
    this.columns = columns;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.points = this.makeShatterPoints();
    this.screenSnap = SceneManager.snap();
    this.triangleSprites = [];
    this.updater = new Sprite();
    SceneManager._scene.addChild(this.updater);
    this.updater.update = this.update.bind(this);
    this.xShatterTrigger = Graphics.width;
  }

  makeShatterPoints() {
    const w = this.width;
    const h = this.height;
    const colW = w / this.columns;
    const rowH = h / this.rows;
    const array = [];
    for(let r = 0; r <= this.rows; r++) {
      array[r] = [];
      for(let c = 0; c <= this.columns; c++) {
        array[r][c] = new ShatterPoint(c * colW, r * rowH, 0, w, 0, h, c, r);
      }
    }
    return array;
  }

  randomizePoints() {
    const w = this.width / this.columns;
    const h = this.height / this.rows;
    const minXvariation = w * 0.3;
    const maxXvariation = w * 0.5;
    const minYvariation = h * 0.3;
    const maxYvariation = h * 0.5;
    const makeRandomXVariation = function() {
      return Math.min(Math.max(Math.random() * maxXvariation, minXvariation), maxXvariation);
    }
    const makeRandomYVariation = function() {
      return Math.min(Math.max(Math.random() * maxYvariation, minYvariation), maxYvariation);
    }
    for(let r = 0; r <= this.rows; r++) {
      for(let c = 0; c <= this.columns; c++) {
        this.points[r][c].randomize(makeRandomXVariation(),makeRandomYVariation());
      }
    }
  }

  drawFirstHalfTriangles() {
    for(let r = 0; r < this.rows; r++) {
      for(let c = 0; c < this.columns; c++) {
        const triangle = new ShatterTriangle([this.points[r][c], this.points[r+1][c], this.points[r][c+1]]);
        const trianglespr = triangle.makeSprite(0xFF0000, 1);
        const screenSnapSpr = new Sprite(this.screenSnap);
        screenSnapSpr.mask = trianglespr;
        screenSnapSpr.addChild(trianglespr);
        SceneManager._scene.addChild(screenSnapSpr);
        trianglespr.x = -triangle.getLeftX();
        trianglespr.y = -triangle.getTopY();
        screenSnapSpr.setFrame(triangle.getLeftX(), triangle.getTopY(), trianglespr.width, trianglespr.height);
        screenSnapSpr.x = triangle.getLeftX();
        screenSnapSpr.y = triangle.getTopY();
        this.triangleSprites.push(screenSnapSpr);
      }
    }
  }

  drawSecondHalfTriangles() {
    for(let r = 0; r < this.rows; r++) {
      for(let c = 0; c < this.columns; c++) {
        const triangle = new ShatterTriangle([this.points[r][c+1], this.points[r+1][c], this.points[r+1][c+1]]);
        const trianglespr = triangle.makeSprite(0x00FF00, 1);
        const screenSnapSpr = new Sprite(this.screenSnap);
        screenSnapSpr.mask = trianglespr;
        screenSnapSpr.addChild(trianglespr);
        SceneManager._scene.addChild(screenSnapSpr);
        trianglespr.x = -triangle.getLeftX();
        trianglespr.y = -triangle.getTopY();
        screenSnapSpr.setFrame(triangle.getLeftX(), triangle.getTopY(), trianglespr.width, trianglespr.height);
        screenSnapSpr.x = triangle.getLeftX();
        screenSnapSpr.y = triangle.getTopY();
        this.triangleSprites.push(screenSnapSpr);
      }
    }
  }

  snapScreen() {
    this.screenSnap = SceneManager.snap();
  }
  
  drawBlackLayer() {
    const blackLayer = new PIXI.Graphics();
    blackLayer.beginFill(0x000000, 1);
    blackLayer.drawRect(0,0,Graphics.width, Graphics.height);
    blackLayer.endFill();
    SceneManager._scene.addChild(blackLayer);
  }

  drawShatters() {
    this.drawFirstHalfTriangles();
    this.drawSecondHalfTriangles();
    this.sortTriangles();
    this.createBloomEffect();
    this.createZoomBlurEffect();
    this.createTrianglesDelay();
    this.moveTrianglesABit();
  }

  sortTriangles() {
    this.triangleSprites.sort((a, b) => b.x - a.x);
  }

  createBloomEffect() {
    const bloomEffect = new PIXI.filters.AdvancedBloomFilter();
    bloomEffect.brightness = 1.5;
    bloomEffect.quality = 1;
    bloomEffect.threshold = .1;
    bloomEffect.kernels = [3];
    const scene = SceneManager._scene;
    scene.filters = scene.filters ?? [];
    scene.filters.push(bloomEffect);
    scene.shatterScreenBloomEffect = bloomEffect;
    this.bloomEffect = bloomEffect;
  }

  createZoomBlurEffect() {
    const zoomBlurEffect = new PIXI.filters.ZoomBlurFilter();
    zoomBlurEffect.center[1] = Graphics.height/2;
    zoomBlurEffect.strength = 0.0;
    const scene = SceneManager._scene;
    scene.filters = scene.filters ?? [];
    scene.filters.push(zoomBlurEffect);
    scene.shatterScreenZoomBlurEffect = zoomBlurEffect;
    this.zoomBlurEffect = zoomBlurEffect;
    this.zoomBlurEffect.delay = 10;
  } 

  createTrianglesDelay() {
    this.triangleSprites.forEach(triangleSpr => {
      triangleSpr.delay = 15 + Math.random() * 20;
    });
  }

  triangleIndividualAnimationDelay() {
    return 2;
  }

  moveTrianglesABit() {
    const amplitude = 5;
    this.triangleSprites.forEach(triangle => {
      triangle.x += Math.random() * amplitude;
      triangle.x -= Math.random() * amplitude;
      triangle.y += Math.random() * amplitude;
      triangle.y -= Math.random() * amplitude;
      triangle.angle += Math.random() * 0; 
    })
  }

  update() {
    const scaleSpeed = .015;
    const angleSpeed = 0.1;
    const horizontalSpeed = 35;
    const verticalSpeed = horizontalSpeed;
    const brightnessDecreaseSpeed = 0.02;
    const alphaDecreaseSpeed = 0.0100;
    const zoomBlurStrengthSpeed = 0.002;
    this.triangleSprites.forEach(triangle => {
      if(triangle.x > this.xShatterTrigger) {
        triangle.delay--;
        if(triangle.delay <= 0) {
          triangle.x += horizontalSpeed + Math.abs(triangle.delay) * 1.5;
          // triangle.y += .1;
          triangle.angle += angleSpeed; 
          triangle.scale.x += scaleSpeed;
          triangle.scale.y += scaleSpeed;
          triangle.alpha -= alphaDecreaseSpeed;
        } 
      } else {
        const distanceX = Math.abs(Graphics.width/2 - triangle.x);
        const ratioX = 0.03;
        triangle.x += triangle.x < Graphics.width /2 ?
          distanceX * ratioX * -horizontalSpeed * 0.005 :
          distanceX * ratioX * horizontalSpeed * 0.005 ;
        const distanceY = Math.abs(Graphics.height/2 - triangle.y);
        const ratioY = 0.03;
        triangle.y += triangle.y < Graphics.width /2 ?
          distanceY * ratioY * -verticalSpeed * 0.005 :
          distanceY * ratioY * verticalSpeed * 0.005 ;
      }
    });
    this.xShatterTrigger -= this.xShatterTriggerSpeed();
    
    this.bloomEffect.brightness = Math.max(0, this.bloomEffect.brightness - brightnessDecreaseSpeed);
    if(this.zoomBlurEffect.delay <= 0) {
      this.zoomBlurEffect.strength += zoomBlurStrengthSpeed;
    } else {
      this.zoomBlurEffect.delay--;
    }
  }

  xShatterTriggerSpeed() {
    return 26;
  }
}

class EncounterEffect {
  constructor() {
    this._scene = SceneManager._scene;
    this._snap = null;
    this._encounterEffectDuration = 100;
  }

  start() {
    const scene = this._scene;
    scene._encounterEffectDuration = this._encounterEffectDuration;
    this._snap = SceneManager.snap();
  }
  end() {
    const scene = this._scene;
    BattleManager.playBattleBgm();
    scene.startFadeOut(scene.fadeSpeed());
  }

  update() {}
}

class EncounterEffect_FFX extends EncounterEffect {
  start() {
    super.start();
    const grid = new ShatterGrid(13, 13, Graphics.width, Graphics.height);
    grid.snapScreen();
    grid.randomizePoints();
    grid.drawBlackLayer();
    grid.drawShatters(); 
    this._encounterEffectDuration = 130;
    // this.test();
  }

  update() {
    if(this._scene._encounterEffectDuration == 80) {
      BattleManager.playBattleBgm();
    }
    if(this._scene._encounterEffectDuration == 45) {
      this._scene.startFadeOut(20);
    }
  }

  test() {
    const bmp = ImageManager.loadPicture("Actor1_1");
    $gameTemp.constantSpriteTest = new Sprite(bmp);
    SceneManager._scene.addChild($gameTemp.constantSpriteTest);

    Scene_Battle.prototype.create = function() {
      Scene_Message.prototype.create.call(this);
      this.createDisplayObjects();
      SceneManager._scene.addChild($gameTemp.constantSpriteTest);
    };
  }
}

class EncounterEffect_GlassBreak extends EncounterEffect {

}

class EncounterEffect_FF7 extends EncounterEffect {

}

class EncounterEffect_FF8 extends EncounterEffect {

}

class EncounterEffect_FF9 extends EncounterEffect {

}


Scene_Map.prototype.startEncounterEffect = function() {
  this._currentEncounterEffect = new EncounterEffect_FFX(this);
  this._currentEncounterEffect.start();
}


Scene_Map.prototype.updateEncounterEffect = function() {
  if(this._encounterEffectDuration <= 0) return;
  this._currentEncounterEffect.update(this._encounterEffectDuration);
  this._encounterEffectDuration--;
}

MGC_Test = function() {
  const bmp = ImageManager.loadPicture("Test_2");
  window.spr = new Sprite(bmp);
  window.fltr = new PIXI.filters.AdjustmentFilter();
  SceneManager._scene.addChild(window.spr);
  window.spr.filters = [window.fltr];
}