// =====================================================================
//  PIED BABY-FOOT MONNERET — Patin / Sabot de pied
//  Geometrie validee sur la PIECE REELLE (photos src/) :
//   - corps PLEIN, aretes exterieures arrondies (R2)
//   - CREUX de 5 mm dans le TOIT INCLINE, ⊥ a la face, borde de 2 mm
//   - collerette pleine de 3 mm autour du trou (au niveau du toit)
//   - trou Ø5 (moitie haute) + CONTRE-PERCAGE par le dessous :
//       Ø plus grand, profondeur = moitie de la piece, fond plat,
//       entree legerement conique. La vis entre par le dessous.
//  Repere : longueur = X, largeur = Y, hauteur = Z, dessous a Z = 0.
//
//  Export STL : F6 (rendu) puis "Export as STL".
// =====================================================================

/* [Dimensions principales (cotees)] */
L       = 101;
W       = 28;
H_thick = 35;
H_thin  = 6;
hole_d  = 5;       // perçage de la vis (moitie haute)

/* [Creux du toit incline] */
border       = 2;    // bordure tout autour du creux
recess_depth = 5;    // profondeur du creux (perpendiculaire a la face)
lip          = 0.8;  // leger arrondi/adouci de la levre (bordure) du creux

/* [Percage] */
o5_depth = 10;     // Ø5 sur 1 cm depuis le toit, puis Ø10 jusqu'au bout
cb_d     = 10;     // diametre de la partie basse (logement tete de vis)
cb_cham  = 1.5;    // epaulement leger (chanfrein) a la jonction Ø5/Ø10

/* [Arrondis] */
cong       = 2;    // arrondi des aretes exterieures (R2)
fillet_int = 2;    // conges interieurs (R2) du creux

$fn = 32;
eps = 0.01;
slope    = atan((H_thick - H_thin) / L);
face_len = L / cos(slope);
z_center = (H_thin + H_thick) / 2;
axis_len = z_center / cos(slope);   // longueur de l'axe du trou (toit -> dessous)

module rrect(x, y, r) {
    hull() for (i = [-1, 1], j = [-1, 1])
        translate([i * (x/2 - r), j * (y/2 - r)]) circle(r = r);
}
module wedge_core() {
    rotate([90, 0, 0]) linear_extrude(height = W - 2*cong, center = true)
        offset(-cong) polygon([[-L/2, 0], [L/2, 0], [L/2, H_thick], [-L/2, H_thin]]);
}
// coin plein (taille reelle) — utilise pour le calcul du creux
module wedge_full() {
    rotate([90, 0, 0]) linear_extrude(height = W, center = true)
        polygon([[-L/2, 0], [L/2, 0], [L/2, H_thick], [-L/2, H_thin]]);
}
module body() { minkowski() { wedge_core(); sphere(r = cong, $fn = 14); } }

// repere aligne sur la face inclinee : Z local = normale ; surface a z_local = cong
module on_face() { translate([0, 0, z_center]) rotate([0, -slope, 0]) children(); }

// couche de profondeur d sous le toit (mesuree PERPENDICULAIREMENT au toit)
module top_layer(d) {
    difference() {
        wedge_full();
        translate([d*sin(slope), 0, -d*cos(slope)]) wedge_full();
    }
}
// creux : parois VERTICALES (alignees sur le plan du bas), fond parallele au toit,
// profondeur 5 mm perpendiculaire ; levre legerement arrondie (lip)
module recess() {
    minkowski() {
        intersection() {
            translate([0, 0, -1]) linear_extrude(H_thick + 12)
                rrect(L - 2*border - 2*lip, W - 2*border - 2*lip, max(fillet_int - lip, 0.6));
            top_layer(recess_depth - lip);
        }
        sphere(r = lip, $fn = 10);
    }
}
// percage : Ø5 sur 1 cm (depuis le toit) -> epaulement leger -> Ø10 jusqu'au bout
module fixing_hole() {
    on_face() {
        translate([0, 0, -o5_depth])          cylinder(h = o5_depth + 6, d = hole_d);                    // Ø5 (toit -> 10 mm)
        translate([0, 0, -o5_depth - cb_cham]) cylinder(h = cb_cham + eps, d1 = cb_d, d2 = hole_d);       // epaulement leger (chanfrein)
        translate([0, 0, -axis_len - 8])       cylinder(h = axis_len + 8 - o5_depth - cb_cham, d = cb_d); // Ø10 jusqu'au bout (deborde -> traverse)
    }
}

// ===================== assemblage =====================
difference() {
    body();
    recess();
    fixing_hole();
}
