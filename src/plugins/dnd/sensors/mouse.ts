import { bindEvents } from '../../../utils/event/bindEvents';
import { findClosestDraggerElementFromEvent } from '../find';
import { hasDraggerHandlerMatched } from './utils';
import {
  MoveAPI,
  GetClone,
  Config,
  Impact,
  MoveHandlerOutput,
  GlobalConfig,
  MoveHandlerResult,
} from '../../../types';
import Dragger from '../Dragger';
import Container from '../Container';
import Sabar from 'sabar';
import DndEffects from '../middleware/onMove/effects/DndEffects';

class Mouse {
  private moveAPI: MoveAPI;
  private getClone: GetClone;
  private onStartHandler: Sabar;
  private onMoveHandler: Sabar;
  private getDragger: (id: string) => Dragger;
  private configs: Config[];
  private dndEffects: DndEffects;
  private updateImpact: (impact: Impact) => void;
  private dndConfig: GlobalConfig;

  constructor({
    moveAPI,
    getClone,
    onStartHandler,
    onMoveHandler,
    getDragger,
    configs,
    dndEffects,
    updateImpact,
    dndConfig,
  }: {
    moveAPI: MoveAPI;
    getClone: GetClone;
    onStartHandler: Sabar;
    onMoveHandler: Sabar;
    getDragger: (id: string) => Dragger;
    configs: Config[];
    dndEffects: DndEffects;
    updateImpact: (impact: Impact) => void;
    dndConfig: GlobalConfig;
  }) {
    this.moveAPI = moveAPI;
    this.getClone = getClone;
    this.getDragger = getDragger;
    this.onStartHandler = onStartHandler;
    this.onMoveHandler = onMoveHandler;
    this.configs = configs;
    this.dndEffects = dndEffects;
    this.updateImpact = updateImpact;
    this.dndConfig = dndConfig;
  }

  start() {
    bindEvents(window, {
      eventName: 'mousedown',
      fn: event => {
        const el = findClosestDraggerElementFromEvent(event);
        if (el === -1) return;
        const { target } = event;
        if (!hasDraggerHandlerMatched(target as HTMLElement, this.configs))
          return;
        // https://stackoverflow.com/a/19164149/2006805 In order to prevent text
        // selection when moving cursor
        event.preventDefault();
        const draggerId = el.getAttribute('data-dragger-id');
        const dragger = this.getDragger(draggerId as string);
        const vContainer = dragger.container;
        const liftUpVDraggerIndex = vContainer.children.findIndex(dragger);

        this.onStartHandler.start({ dragger, event });
        const clone = this.getClone();
        let output: MoveHandlerOutput;

        // If dragger exists, then start to bind relative listener
        const unbind = bindEvents(window, [
          {
            // target should be moved by mousemove event.
            eventName: 'mousemove',
            fn: (event: MouseEvent) => {
              // ts-hint: https://stackoverflow.com/questions/41110144/property-clientx-does-not-exist-on-type-event-angular2-directive
              const impactPoint = [event.clientX, event.clientY];
              event.preventDefault();
              event.stopPropagation();
              const isHomeContainer = (vContainer: Container) => {
                return vContainer
                  ? vContainer.id === dragger.container.id
                  : false;
              };

              const result = this.onMoveHandler.start({
                // event,
                impactPoint,
                impactVDragger: dragger,
                liftUpVDragger: dragger,
                liftUpVDraggerIndex,
                dragger,
                clone,
                isHomeContainer,
                ...this.moveAPI(),
              }) as MoveHandlerResult;

              const { impact } = result;
              output = result.output;
              if (impact) this.updateImpact(impact);
            },
          },
          {
            eventName: 'mouseup',
            fn: () => {
              unbind();

              if (this.dndConfig.onDrop) {
                this.dndConfig.onDrop(output);
              }

              this.dndEffects.teardown();
              if (clone) document.body.removeChild(clone);
            },
          },
        ]);
      },
    });
  }
}

export default Mouse;
