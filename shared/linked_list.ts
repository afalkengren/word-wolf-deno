interface LinkedItem<T> {
  next: LinkedItem<T> | null;
  data: T;
}

export class LinkedList<T> {
  public head: LinkedItem<T>;
  public tail: LinkedItem<T>;
  public length: number;

  public append(item: LinkedItem<T>): number {
    this.tail.next = item;
    this.length += 1;
    return this.length;
  }

  public insert(item: LinkedItem<T>, at: number) {
    let prevNode: LinkedItem<T> = null;
    let node: LinkedItem<T> = this.head;
    // traverse linked list
    for (let i = 0; i < Math.min(at, this.length); ++i) {
      prevNode = node;
      node = node.next;
    }
    if (prevNode === null) {
      this.head = item;
    } else {
      prevNode.next = item;
    }
    item.next = node;
  }

  public remove(at: number): LinkedItem<T> {
    let prevNode: LinkedItem<T> = null;
    let node: LinkedItem<T> = this.head;
    // traverse linked list
    for (let i = 0; i < Math.min(at, this.length); ++i) {
      prevNode = node;
      node = node.next;
    }
    if (prevNode === null) {
      this.head = node.next;
    } else {
      prevNode.next = node.next;
    }
    node.next = null;
    return node;
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
    return this.append({ next: null, data });
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