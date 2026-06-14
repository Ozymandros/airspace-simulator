import { Matrix4, Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { syncEntity } from './sync';

describe('syncEntity', () => {
  it('copies the Yuka world matrix onto the render component', () => {
    const source = new Matrix4().makeTranslation(3, 5, 7);
    const entity = { worldMatrix: source };
    const renderComponent = new Object3D();

    syncEntity(entity as never, renderComponent);

    expect(renderComponent.matrix.elements).toEqual(source.elements);
  });
});
