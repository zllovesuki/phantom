export namespace client {
	
	export class Tunnel {
	    target: string;
	    hostname?: string;
	
	    static createFrom(source: any = {}) {
	        return new Tunnel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.target = source["target"];
	        this.hostname = source["hostname"];
	    }
	}
	export class Config {
	    apex: string;
	    clientId?: number;
	    token?: string;
	    tunnels?: Tunnel[];
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.apex = source["apex"];
	        this.clientId = source["clientId"];
	        this.token = source["token"];
	        this.tunnels = this.convertValues(source["tunnels"], Tunnel);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace rtt {
	
	export class Statistics {
	    // Go type: time.Time
	    since: any;
	    // Go type: time.Time
	    until: any;
	    min: number;
	    average: number;
	    max: number;
	    mdev: number;
	    sent: number;
	    lost: number;
	
	    static createFrom(source: any = {}) {
	        return new Statistics(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.since = this.convertValues(source["since"], null);
	        this.until = this.convertValues(source["until"], null);
	        this.min = source["min"];
	        this.average = source["average"];
	        this.max = source["max"];
	        this.mdev = source["mdev"];
	        this.sent = source["sent"];
	        this.lost = source["lost"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace specter {
	
	export class Node {
	    id?: number;
	    address?: string;
	    unknown?: boolean;
	    rtt?: rtt.Statistics;
	
	    static createFrom(source: any = {}) {
	        return new Node(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.address = source["address"];
	        this.unknown = source["unknown"];
	        this.rtt = this.convertValues(source["rtt"], rtt.Statistics);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PhantomConfig {
	    specterInsecure: boolean;
	    targetInsecure: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PhantomConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.specterInsecure = source["specterInsecure"];
	        this.targetInsecure = source["targetInsecure"];
	    }
	}
	export class Target {
	    protocol: string;
	    destination: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new Target(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.protocol = source["protocol"];
	        this.destination = source["destination"];
	        this.error = source["error"];
	    }
	}

}

