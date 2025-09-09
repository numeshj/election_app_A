// Generic sorting helpers reused across views
export function sortList(list, { field, dir }, type='auto'){
  const arr=[...list];
  arr.sort((a,b)=> compareValues(a[field], b[field], type, dir));
  return arr;
}

function compareValues(a,b,type,dir){
  if(type==='string' || (type==='auto' && (typeof a==='string'|| typeof b==='string'))){
    const va=(a||'').toString(); const vb=(b||'').toString();
    return dir==='asc'? va.localeCompare(vb): vb.localeCompare(va);
  }
  if(type==='number' || (type==='auto' && typeof a==='number' && typeof b==='number')){
    return dir==='asc'? (a-b):(b-a);
  }
  return 0;
}

export function toggleSort(state, field){
  if(state.field===field){
    return { field, dir: state.dir==='asc' ? 'desc':'asc' };
  }
  return { field, dir:'asc' };
}
