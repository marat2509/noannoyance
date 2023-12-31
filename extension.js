const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

class StealMyFocus {
  constructor() {
    this._windowDemandsAttentionId = global.display.connect('window-demands-attention', this._onWindowDemandsAttention.bind(this));
    this._windowMarkedUrgentId = global.display.connect('window-marked-urgent', this._onWindowDemandsAttention.bind(this));
  }

  _onWindowDemandsAttention(display, window) {
    if (!window || window.has_focus() || window.is_skip_taskbar())
      return;

    let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.noannoyance');
    let preventDisable = settings.get_boolean('enable-ignorelist');
    let byClassList = settings.get_strv('by-class');

    if (preventDisable && byClassList.includes(window.get_wm_class())) {
      return;
    }
  }

  destroy() {
    global.display.disconnect(this._windowDemandsAttentionId);
    global.display.disconnect(this._windowMarkedUrgentId);
  }
}

let stealmyfocus;
let oldHandler;

function init() {
}

function enable() {
  global.display.disconnect(Main.windowAttentionHandler._windowDemandsAttentionId);
  global.display.disconnect(Main.windowAttentionHandler._windowMarkedUrgentId);
  oldHandler = Main.windowAttentionHandler;

  stealmyfocus = new StealMyFocus();

  Main.windowAttentionHandler = stealmyfocus;
}

function disable() {
  stealmyfocus.destroy();
  stealmyfocus = null;

  oldHandler._windowDemandsAttentionId = global.display.connect('window-demands-attention', oldHandler._onWindowDemandsAttention.bind(oldHandler));
  oldHandler._windowMarkedUrgentId = global.display.connect('window-marked-urgent', oldHandler._onWindowDemandsAttention.bind(oldHandler));

  Main.windowAttentionHandler = oldHandler;
}
