import { Component, ContentChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { breakNode, clearBordered, clearSelected, groupNodes, updateCanvasPosition } from '../../actions';
import { CeToolbarDirective } from '../../directives';
import { EditorStore } from '../../services';
import { CeUtilsService } from '../../services/utils.service';
import { INode, IStore } from '../../store';

@Component({
  selector: 'ce-toolbar',
  exportAs: 'ceToolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarComponent {
  @ContentChild(CeToolbarDirective)
  ceToolbar: CeToolbarDirective;
  public selected$: Observable<Set<string>>;
  public scale: number;
  public get copyStatus$(): Observable<boolean> {
    return this.selected$.pipe(map((state) => state.size === 0));
  }
  public get groupStatus$(): Observable<boolean> {
    return this.selected$.pipe(map((state) => state.size <= 1));
  }
  public get breakStatus$(): Observable<boolean> {
    return this.selected$.pipe(
      map((state) => (state.size === 1 ? [...state][0] : false)),
      map((id) => id && !!this.utils.getNodeById(id as string, this.nodes)?.children?.length)
    );
  }
  private nodes: INode[] = [];
  private selected: Set<string>;

  constructor(public store: EditorStore<IStore>, private utils: CeUtilsService) {
    this.selected$ = this.store.select((state) => state.selected);
    this.store.select((state) => state.nodes).subscribe((nodes) => (this.nodes = nodes));
    this.store.select((state) => state.canvasPosition).subscribe((state) => (this.scale = state.scale));
    this.selected$.subscribe((selected) => (this.selected = selected));
  }

  setCanvasScale(scale: number): void {
    this.store.dispatch(updateCanvasPosition({ scale: scale / 100 }));
  }

  groupNodes(): void {
    const ids = [...this.selected];
    this.store.dispatch(clearSelected());
    this.store.dispatch(clearBordered());
    this.store.dispatch(groupNodes(ids));
  }

  breakNode(): void {
    const node = this.utils.getNodeById([...this.selected][0], this.nodes);
    this.store.dispatch(clearSelected());
    this.store.dispatch(clearBordered());
    this.store.dispatch(breakNode(node.id));
  }
}
