/*:
 * @target MZ
 * @author ManuGamingCreations
 * @url https://manugamingcreations.itch.io
 * @plugindesc [0.4][EN] Battle Transition Ultra MZ
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
 * The plugin will change the default battle transition to a "Screen Shattering" or a "Screen Twist" one.
 * 
 * [BUG REPORT]
 * Please report bugs through Patreon messaging (https://patreon.com/manugamingcreations)
 * 
 * [KNOWN BUGS]
 * Does not work with Visustella Action Sequence Impact plugin, trying to fix it.
 * 
 *
 * @orderAfter pixi-filters
 * 
 * @param encounterEffectType
 * @text Encounter Effect Type
 * @desc Pick the encounter effect here.
 * @type select
 * @option FF9
 * @value FF9
 * @option FFX
 * @value FFX
 * @option Image
 * @value Image
 * @default FF9
 * 
 * @param transitionImageGroup
 * @text Image Transition Settings
 * 
 * 
 * @param transitionPicture
 * @parent transitionImageGroup
 * @text Transition Picture
 * @desc Select picture
 * @type file 
 * @default "img/"
 * 
 * @param transitionPictureSpeed:num
 * @parent transitionImageGroup
 * @text Picture Transition Speed
 * @desc Speed (0.01 ~ 0.03 for best results)
 * @type text
 * @default 0.015
*/

(() => {

  ImageTransitionFilter = class extends PIXI.Filter {
    constructor() {
      super(null, 
        `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float uStep;
          void main() {
            // Sample the texture
            vec4 textureColor = texture2D(uSampler, vTextureCoord);
  
            // Apply step function to the grayscale value with the threshold
            float alpha = step(1.0 - uStep, 1.0 - textureColor.r);
  
            // White 
            // gl_FragColor = vec4(1.0 * alpha,1.0 * alpha,1.0 * alpha , alpha);
  
            // Black
            gl_FragColor = vec4(0.0 * alpha,0.0 * alpha,0.0 * alpha , alpha);
          }
        `,
        {
          uStep: 0.0
        }
      );
    }
  }

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
        // console.log('border');
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
      zoomBlurEffect.center[1] = Graphics.height / 2;
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

    setSceneEncounterEffectDuration(duration = 60) {
      this._scene._encounterEffectDuration = duration;
    }
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
    }
  
    update() {
      if(this._scene._encounterEffectDuration == 80) {
        BattleManager.playBattleBgm();
      }
      if(this._scene._encounterEffectDuration == 45) {
        this._scene.startFadeOut(20);
      }
    }
  
    test() {}
  }

  class EncounterEffect_ImageTransition extends EncounterEffect {
    start() {
      super.start();
      const image = new Sprite(getTransitionPicture());
      this.image = image;
      image.bitmap.addLoadListener(() => {
        image.scale.x = Graphics.width / image.width;
        image.scale.y = Graphics.height / image.height;
      });
      SceneManager._scene.addChild(this.image);
      const transitionFilter = new ImageTransitionFilter();
      image.filters = [transitionFilter];
      console.log(transitionFilter);
      // image.uStepSpeed = .015;
      image.uStepSpeed = getPictureTransitionSpeed();
      image.update = () => {
        transitionFilter.uniforms.uStep += image.uStepSpeed;
        transitionFilter.uniforms.uStep = Math.min(transitionFilter.uniforms.uStep, 1);
        transitionFilter.uniforms.uStep = Math.max(transitionFilter.uniforms.uStep, 0);
      }

      const sceneTransitionDuration = 1 / getPictureTransitionSpeed();
      this.setSceneEncounterEffectDuration(sceneTransitionDuration);
    }

    update() {
      if(this._scene._encounterEffectDuration == 1) {
        this._scene.startFadeOut(1);
      }
    }
  }
  
  class EncounterEffect_GlassBreak extends EncounterEffect {}
  
  class EncounterEffect_FF7 extends EncounterEffect {}
  
  class EncounterEffect_FF8 extends EncounterEffect {}
  
  class EncounterEffect_FF9 extends EncounterEffect {
    fadeOutDuration = 20;
    snapContainer = null;
    snapLayer = null;
    twistFilter = null;
    snapCloneTimer = 0;
  
    start() {
      super.start();
      this.prepareScreen();
    }
  
    prepareScreen() {
      this.snap = this.snap ?? SceneManager.snap();
      
      const blackLayerBmp = new Bitmap(Graphics.width, Graphics.height);
      blackLayerBmp.fillAll(0x000000);
      const blackLayer = new Sprite(blackLayerBmp);
      this._scene.addChild(blackLayer);
      this.snapLayer = new Sprite(this.snap);
      this._scene.addChild(this.snapLayer);
      this.snapLayer.anchor.x = 0.5;
      this.snapLayer.anchor.y = 0.5;
      this.snapLayer.x = Graphics.width / 2;
      this.snapLayer.y = Graphics.height / 2;
      this.twistFilter = new PIXI.filters.TwistFilter();
      this.twistFilter.radius = Graphics.width * 1.5;
      this.twistFilter.angle = 0;
      this.kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
      this.kawaseBlurFilter.quality = 2;
      this.kawaseBlurFilter_kernel0 = 0;
      this.kawaseBlurFilter_kernel1 = 0;
      this.kawaseBlurFilter.kernels = [this.kawaseBlurFilter_kernel0, this.kawaseBlurFilter_kernel1];
      this._scene.filters = this._scene.filters ?? [];
      this._scene.filters.push(this.twistFilter);
      // this._scene.filters.push(this.kawaseBlurFilter);
      this.twistFilter.offset.x = Graphics.width / 2;
      this.twistFilter.offset.y = Graphics.height / 2;
    }
    
    animateTransition() {
      const twistAngleSpeed = .2;
      const twistRadiusGrowSpeed = -1;
      const scaleDownSpeed = .011;
      const kblur_kernelSpeed = 0.15;
      const kblur_qualitySpeed = .02;
      const snapCloneDelay = 2;
  
      this.twistFilter.angle += twistAngleSpeed;
      this.twistFilter.radius += twistRadiusGrowSpeed;
  
      this.snapLayer.scale.x -= scaleDownSpeed;
      this.snapLayer.scale.y -= scaleDownSpeed;
      this.snapLayer.scale.x = Math.max(0, this.snapLayer.scale.x);
      this.snapLayer.scale.y = Math.max(0, this.snapLayer.scale.y);
  
      this.kawaseBlurFilter_kernel0 += kblur_kernelSpeed;
      this.kawaseBlurFilter_kernel1 += kblur_kernelSpeed;
      this.kawaseBlurFilter.kernels = [this.kawaseBlurFilter_kernel0, this.kawaseBlurFilter_kernel1];
  
      this.kawaseBlurFilter.quality = 6;
  
      this.snapCloneTimer--;
      if(this.snapCloneTimer <= 0) {
        this.createSnapClone();
        this.snapCloneTimer = snapCloneDelay;
      }
    } 
  
    createSnapClone() {
      const snapClone = new Sprite(this.snap);
      snapClone.blendMode = 1;
      snapClone.alpha = 0.9;
      snapClone.update = function() {
        const alphaDecreaseSpeed = 0.06;
        this.alpha -= alphaDecreaseSpeed;
        if(this.alpha <= 0) {
          this.parent.removeChild(this);
        } 
      }
      snapClone.scale.x = this.snapLayer.scale.x;
      snapClone.scale.x = this.snapLayer.scale.y;
      this._scene.addChild(snapClone);
    }
  
    isTimeToFadeOut() {
      return this._scene._encounterEffectDuration == 20;
    }
  
    isTimeToPlayBgm() {
      return this._scene._encounterEffectDuration == 40;
    }
    
    update() {
      this.animateTransition();
      if(this.isTimeToFadeOut()) {
        this._scene.startFadeOut(this.fadeOutDuration);
      }
      if(this.isTimeToPlayBgm()) {
        BattleManager.playBattleBgm();
      }
    }
  }


  const plugin = "MGC_BattleTransitionUltraMZ";
  const pluginParameters = PluginManager.parameters(plugin);

  const plugin_encounterEffectName = pluginParameters["encounterEffectType"];
  const plugin_transitionPictureName = pluginParameters["transitionPicture"];
  const plugin_transitionPictureSpeed = pluginParameters["transitionPictureSpeed:num"];
  // PluginManager.parameters()

  function getEncounterObjectByKey(key) {
    switch(key) {
      case "FF9":
        return new EncounterEffect_FF9();
      case "FFX":
        return new EncounterEffect_FFX();
      case "Image":
        return new EncounterEffect_ImageTransition();
      default:
        return new EncounterEffect_FFX();
    }
  }

  function getTransitionPicture() {
    let split = plugin_transitionPictureName.split("/");
    let fileName = split.pop();
    let folderName = (() => {
      let string = "";
      split.forEach(part => {
        string += part + "/";
      });
      return string;
    })();
    console.log(folderName);
    return ImageManager.loadBitmap(folderName, fileName);
  }

  function getPictureTransitionSpeed() {
    return Number(plugin_transitionPictureSpeed);
  }
  
  
  Scene_Map.prototype.startEncounterEffect = function() {
    // this._currentEncounterEffect = new EncounterEffect_FFX();
    this._currentEncounterEffect = getEncounterObjectByKey(plugin_encounterEffectName);
    this._currentEncounterEffect.start();
  }
  
  
  Scene_Map.prototype.updateEncounterEffect = function() {
    if(this._encounterEffectDuration <= 0) return;
    this._currentEncounterEffect.update(this._encounterEffectDuration);
    this._encounterEffectDuration--;
  }
  
})();

MGC_Test = function() {
  const bmp = ImageManager.loadPicture("grad_1");
  window.spr = new Sprite(bmp);
  window.fltr = new PIXI.filters.AdjustmentFilter();
  SceneManager._scene.addChild(window.spr);
  window.spr.filters = [window.fltr];
}