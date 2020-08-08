export interface LinkedNode<T> {
  next?: LinkedNode<T>;
  data: T;
}

type LinkedNodeOpt<T> = LinkedNode<T> | undefined;

export class LinkedList<T> {
  protected _head?: LinkedNode<T>;
  protected _tail?: LinkedNode<T>;
  protected _length: number = 0;

  public get head() { return this._head; }
  public get tail() { return this._tail; }
  public get length() { return this._length; }

  public append(newNode: LinkedNode<T>): number {
    if (this._tail) {
      this._tail.next = newNode;
      this._length += 1;
    } else {
      newNode.next = undefined;
      this._head = newNode;
      this._tail = newNode;
      this._length = 1;
    }
    return this._length;
  }

  public insert(newNode: LinkedNode<T>, at: number) {
    if (this._length === 0) {
      this._head = newNode;
      this._tail = newNode;
      this._length = 1;
      return;
    }
    const { prevNode, currNode } = this.walkList(at);
    if (prevNode === undefined) {
      this._head = newNode;
    } else {
      prevNode.next = newNode;
    }
    newNode.next = currNode;
    this._length += 1;
    if (newNode.next === undefined) {
      this._tail = newNode;
    }
  }

  public remove(at: number): LinkedNodeOpt<T> {
    const { prevNode, currNode } = this.walkList(at);
    if (prevNode === undefined) {
      if (currNode === undefined) { return undefined; }
      this._head = currNode.next;
    } else {
      // if end of list, currNode?.next = undefined
      prevNode.next = currNode?.next;
      if (prevNode.next === undefined) {
        this._tail = prevNode;
      }
    }
    delete currNode?.next; // remove reference to next
    this._length -= 1;
    return currNode;
  }

  private walkList(until: number): { prevNode: LinkedNodeOpt<T>, currNode: LinkedNodeOpt<T> } {
    let prevNode: LinkedNodeOpt<T> = undefined;
    let currNode: LinkedNodeOpt<T> = this._head;

    // traverse linked list
    for (let i = 0; i < Math.min(until, this._length); ++i) {
      prevNode = currNode;
      currNode = currNode?.next;
    }
    return { prevNode, currNode };
  }
}

export class Queue<T> extends LinkedList<T> {
  public get front(): T | undefined { return this._head?.data };
  public get back(): T | undefined { return this._tail?.data };

  public dequeue(): T | undefined {
    if (this._head === undefined) return undefined;
    const item = this._head;
    this._head = item.next;
    delete item.next;
    this._length -= 1;
    return item.data;
  }

  public enqueue(data: T): number {
    return this.append({ next: undefined, data });
  }
}
