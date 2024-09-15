DRAWIO ?= "/Applications/draw.io.app/Contents/MacOS/draw.io"
diagrams:
	$(DRAWIO) -x -f jpg -o Phase_1/team006_p1_eer.jpg Phase_1/team006_p1_eer.drawio
	$(DRAWIO) -x -f pdf -o Phase_1/team006_p1_eer.pdf Phase_1/team006_p1_eer.drawio
	$(DRAWIO) -x -f jpg -o Phase_1/team006_p1_ifd.jpg Phase_1/team006_p1_ifd.drawio
	$(DRAWIO) -x -f pdf -o Phase_1/team006_p1_ifd.pdf Phase_1/team006_p1_ifd.drawio
