# taco-bell
Taco bell reactive js framework with a single model source of truth. Simple as rice and beans.

### building
_Prerequisite:_ npm/node

* `./install` to install dependencies
* `tsc` to build

## Examples
### [Starter Template](https://www.npmjs.com/package/taco-bell-starter)

### [Tetris](https://www.npmjs.com/package/taco-bell-tetris)
[Preview](https://bglowney.github.io/tetris.html)

### [Todo mvc](https://www.npmjs.com/package/taco-bell-todo-mvc)
[Preview](https://bglowney.github.io/todo.html)

## Optimizations

Taco bell completely avoids use of HTML and instead operates on DOM elements themselves. There are two optimizations to
bear in mind here:

1. __Browser repaints__: The browser will only repaint once per javascript execution. So if an event is called, repaint
is blocked regardless of how many dom nodes we manipulate.

2. __Browser reflow__: Modifying a DOM node property that is a factor to the DOM's rendering will trigger a recalculation
 of the node and related node's appearance, e.g. their size, position, etc. Reflows may take place multiple times during
 javascript execution _provided the node being modified is currently in the DOM_. Taco Bell takes the approach to 
 carefully remove nodes from the DOM, perform updates, and at the end of a cycle replace the nodes into the DOM so that
 only a single reflow is calculated.
 
```
 ...
 model.children = new ModelArray<string>();
 model.children.add('Bob');
 model.children.add('Alice');

 new Component('grand-parent', document.getElementById('app'))
    .child(
        new Collection('parent')
            .children(model.children, (name, i) -> {
                return new Component('child')
                    .withAttribute('id', i)
                    .withText(name);
            })
    );
 
 // explicitly start a cycle to initiate the app
 ComponentQueue.cycle();
```     
Yields
```
<div id="app">

 <grand-parent>
    <parent>
        <child id="1">Bob</child>
        <child id="2">Alice</child>
    </parent>
 </grand-parent>
 
</div> 
```
 
 Within a cycle Taco Bell progressively updates a pointer to the greatest common ancestor of all dirty nodes. Before any
 node is updated, it is removed, and if it is an ancestor of the current ancestor, then it is made the new ancestor, 
 while all of its children are also removed. At the end of the cycle the ancestor is replaced into the dom and all state
 is reapplied (e.g. event listeners). In the above example, making a change to one of the children, e.g. 
 
 ```
 model.children.get()[0].set('Eve'); 
 ```
 
 will trigger a cycle to only remove `Bob` from the list and replace him with `Eve`.
 
__Managing the Cycle__
Cycles are triggered in multiple ways
* _implicitly_ by user events via `AbstractComponent#on(callback)`. When callback completes a cycle will be triggered to
   apply any changes recorded by executing the callback to the DOM.
* _per component_ via `AbstractComponent#reinit` will trigger a cycle for all changes recorded to the component.  
* _explicitly_ via `ComponentQueue#cycle`. This can be called anytime, however you should only need to call it in two 
 cases.  
   1. In your application startup script after you have created the DOM in order to indicate the app is ready
   2. Anytime changes need to be applied programmatically, i.e. not in response to a user initiated event bound to a 
   component with `AbstractComponent#on(callback)`. Examples can be found [here](https://github.com/bglowney/tetris/blob/master/src/tetris.ts#L129) and [here](https://github.com/bglowney/tetris/blob/master/src/tetris.ts#L232)
  