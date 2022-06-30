export interface AtText {
  lastText: string
  hops: string[]
  hopsCount: number
}

export default function (input: string): AtText {
  if (input.indexOf('*') !== -1) {
    const hops = input.split('*')

    return {
      lastText: hops[hops.length - 1],
      hops: hops,
      hopsCount: hops.length,
    }
  } else if (input === '') {
    //  restore session || start new session
    //  check new user
    return {
      lastText: 'Welcome to weaver',
      hops: [],
      hopsCount: 0,
    }
  } else {
    return {
      lastText: input,
      hops: [input],
      hopsCount: 1,
    }
  }
}
