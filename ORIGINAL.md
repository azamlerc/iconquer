# ORIGINAL.md

Here is some information about the original version of iConquer that I wrote in 2002. 

It is a Mac application written in Objective-C using Project Builder / Xcode.

# Source 

The source code in Objective-C is located at:
../kavasoft/iconquer/

The core game entities are in a separate sub-project in:
iConquerGame

There is HTML documentation for the core objects here:
iConquerGame/Documentation

# Maps

iConquer has a plug-in architecture for maps. 

It comes with one world map built-in:
Maps/iconquer-world/

All maps have an image for each country, plus the following standard files:
./Background.jpg
./Countries.plist - size, position and neighbors of each country
./Continents.plist - groups of countries
English.lproj/Countries.strings - names of countries
English.lproj/Continents.strings - names of continents

# Players

iConquer has a plug-in architecture for players. These use a (very primitive) AI architecture for deciding which moves to make. 

It comes with 12 players built-in:
Players

Aggressive is the most straightforward player, it just tries to win. 

# Website

The iConquer website was written in PHP. The source code is at:
../kavasoft.com/iConquer

There is a PDF of the homepage at:
../kavasoft.com/iConquer/homepage.pdf

The tour contains a description of some features along with images:
../kavasoft.com/iConquer/tour/content.php
../kavasoft.com/iConquer/tour/images/
