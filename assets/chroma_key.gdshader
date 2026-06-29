shader_type canvas_item;

uniform vec4 chroma_key : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float pickup_range : hint_range(0.0, 1.0) = 0.1;
uniform float fade_range : hint_range(0.0, 1.0) = 0.05;

void fragment() {
	vec4 tex_color = texture(TEXTURE, UV);
	float diff = distance(tex_color.rgb, chroma_key.rgb);
	
	if (diff < pickup_range) {
		discard;
	} else if (diff < pickup_range + fade_range) {
		float alpha = smoothstep(pickup_range, pickup_range + fade_range, diff);
		COLOR = vec4(tex_color.rgb, tex_color.a * alpha);
	} else {
		COLOR = tex_color;
	}
}
