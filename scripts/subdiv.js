var _subdiv;

define([
  "util", "vectormath", "math", "draw", "mesh"
], function(util, vectormath, math, draw, mesh) {
  "use strict";
  
  var exports = {};
  
  var Vector2 = vectormath.Vector2;
  var Vector3 = vectormath.Vector3;
  var Vector4 = vectormath.Vector4;
  var Quat = vectormath.Quat;
  var Matrix4 = vectormath.Matrix4;
  
  var vertex_smooth = exports.vertex_smooth = function(mesh) {
    var cos = [];
    for (var i=0; i<mesh.verts.length; i++) {
      var v = mesh.verts[i];
      
      var co = new Vector3();
      
      cos.push(co);
      for (var j=0; j<v.edges.length; j++) {
        var e = v.edges[j];
        
        co.add(e.other_vert(v).co);
      }
      
      co.mulScalar(1.0 / (v.edges.length));
    }
    
    for (var i=0; i<mesh.verts.length; i++) {
      var v = mesh.verts[i];
      
      v.co.load(cos[i]);
    }
  }
  
  var subdivide = exports.subdivide = function(mesh) {
    console.log("subdivision!");
    
    var vedmap = {};
    for (var i=0; i<mesh.edges.length; i++) {
      var e = mesh.edges[i];
      
      var newv = mesh.make_vert();
      newv.co.load(e.v1.co).add(e.v2.co).mulScalar(0.5);
      vedmap[e.eid] = newv;
    }
    
    var faces = [];
    for (var i=0; i<mesh.faces.length; i++) {
      faces.push(mesh.faces[i]);
    }
    
    var delset = {};
    var deleset = {};
    for (var i=0; i<mesh.edges.length; i++) {
      deleset[mesh.edges[i].eid] = mesh.edges[i];
    }
    
    var cent = new Vector3();
    for (var i=0; i<faces.length; i++) {
      var f = faces[i];
      cent.zero();
      var l = f.l;
      do {
        cent.add(l.v.co);
        
        l = l.next;
      } while (l != f.l);
      
      cent.mulScalar(1.0/(f.totvert));
      var centv = mesh.make_vert(cent);
      
      var l = f.l;
      do {
        var v1 = l.v, v2 = l.next.v, v3 = l.next.next.v;
        var e1 = l.e, e2=l.next.e;
        
        v1 = vedmap[e1.eid];
        v3 = vedmap[e2.eid];
        
        var newf = mesh.make_face([v1, v2, v3, centv]);
        newf.orig_eid = f.eid;
        
        l = l.next;
      } while (l != f.l);
      
      delset[f.eid] = f;
    }
   
    for (var k in deleset) {
      var e = deleset[k];
      mesh.kill_edge(e);
    }
    
    mesh.load(mesh.copy());
    
    vertex_smooth(mesh);
    
    mesh.recalc_normals();
    mesh.regen_render();
  }
  
  _subdiv = exports;
  return exports;
});
