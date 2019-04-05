# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/debian-8.11"

  config.vm.hostname = "ANNA-BACKEND"
  config.vm.define "ANNA-BACKEND"
  config.vm.provider :virtualbox do |vb|
      vb.name = "ANNA-BACKEND"
      vb.customize ['setextradata', :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate//home/vagrant/ANNA-Backend", '1']
  end

  config.vm.network "private_network", ip: "192.168.50.5"
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/ANNA-Backend"

  config.vm.provision "shell", path: "./vagrant/configure", privileged: false
end
