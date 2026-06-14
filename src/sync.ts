import type { Matrix4, Object3D } from 'three';
import type { Entity } from 'yuka';

export function syncEntity(entity: Entity, renderComponent: Object3D): void {
  renderComponent.matrix.copy(entity.worldMatrix as unknown as Matrix4);
}
