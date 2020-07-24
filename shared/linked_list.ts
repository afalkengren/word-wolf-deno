export interface LinkedNode<T> {
  next?: LinkedNode<T>;
  data: T;
}

type LinkedNodeOpt<T> = LinkedNode<T> | undefined;

export class LinkedList<T> {
  public head?: LinkedNode<T>;
  readonly tail?: LinkedNode<T>;
  public length: number = 0;

  public append(newNode: LinkedNode<T>): number {
    this.tail.next = newNode;
    this.length += 1;
    return this.length;
  }

  public insert(newNode: LinkedNode<T>, at: number) {
    if (this.length === 0) {
      this.head = newNode;
      return;
    }
    const { prevNode, currNode } = this.walkList(at);
    if (prevNode === undefined) {
      this.head = newNode;
    } else {
      prevNode.next = newNode;
    }
    newNode.next = currNode;
  }

  public remove(at: number): LinkedNodeOpt<T> {
    const { prevNode, currNode } = this.walkList(at);
    if (prevNode === undefined) {
      if (currNode === undefined) { return undefined; }
      this.head = currNode.next;
    } else {
      // if end of list, currNode?.next = undefined
      prevNode.next = currNode?.next;
    }
    delete currNode?.next; // remove reference to next
    return currNode;
  }

  private walkList(until: number): { prevNode: LinkedNodeOpt<T>, currNode: LinkedNodeOpt<T> } {
    let prevNode: LinkedNodeOpt<T> = undefined;
    let currNode: LinkedNodeOpt<T> = this.head;

    // traverse linked list
    for (let i = 0; i < Math.min(until, this.length); ++i) {
      prevNode = currNode;
      currNode = currNode?.next;
    }
    return { prevNode, currNode };
  }
}

export class Queue<T> extends LinkedList<T> {
  get front(): T { return this.head.data };
  get back(): T { return this.tail.data };

  public dequeue(): T {
    const item = this.head;
    this.head = item.next;
    delete item.next;
    this.length -= 1;
    return item.data;
  }

  public enqueue(data: T): number {
    return this.append({ next: undefined, data });
  }

  // replace with private members override
  private insert(item: LinkedItem<T>, at: number) {
    return super.insert(item, at);
  }
  private remove(at: number): LinkedItem<T> {
    return super.remove(at);
  }
  private append(item: LinkedItem<T>): number {
    return super.append(item);
  }
}
