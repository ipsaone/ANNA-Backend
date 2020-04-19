# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/debian-9.11"

  config.vm.hostname = "ANNA-BACKEND"
  config.vm.define "ANNA-BACKEND"
  config.vm.provider :virtualbox do |vb|
      vb.name = "ANNA-BACKEND"
      vb.customize ['setextradata', :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate//home/vagrant/ANNA-Backend", '1']
      vb.cpus = 4
      vb.memory = 2048
  end

  config.vm.network "private_network", ip: "192.168.50.5"
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/ANNA-Backend"
  #config.vm.synced_folder "~/.ssh", "/home/vagrant/.ssh_sync"

  config.vm.provision "shell", path: "./vagrant/configure", privileged: false
end
